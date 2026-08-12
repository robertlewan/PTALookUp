import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { pokemonFamilyById } from '../data';
import { Section, ListRow } from '../components/Section';
import { TypeBadge } from '../components/TypeBadge';
import { movesForProficiency } from '../utils/moves';
import type { PokemonFamily, PokemonStage } from '../types/models';

export default function PokemonDetailScreen() {
  const route = useRoute<any>();
  const family = pokemonFamilyById.get(route.params.familyId);

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Pokémon not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.name}>{family.familyName}</Text>
      {family.evolutionText && <Text style={styles.evolution}>{family.evolutionText}</Text>}

      {family.biology && (
        <Section title="Biology">
          {family.biology.eggGroups.length > 0 && (
            <ListRow label="Egg Groups" value={family.biology.eggGroups.join(', ')} />
          )}
          <ListRow label="Hatch Rate" value={family.biology.hatchRate ?? '—'} />
          <ListRow label="Diet" value={family.biology.diet ?? '—'} />
          {family.biology.habitats.length > 0 && (
            <ListRow label="Habitats" value={family.biology.habitats.join(', ')} />
          )}
          {family.rarity && <ListRow label="Rarity" value={family.rarity} />}
        </Section>
      )}

      {family.proficiencies.length > 0 && (
        <Section title="Proficiencies">
          <Text style={styles.body}>{family.proficiencies.join(', ')}</Text>
        </Section>
      )}

      {(family.megaEvolution || family.gigantamax) && (
        <Section title="Special Forms">
          {family.megaEvolution && <Text style={styles.body}>Has a Mega Evolution</Text>}
          {family.gigantamax && <Text style={styles.body}>Has a Gigantamax form</Text>}
        </Section>
      )}

      {family.stages.map((stage, i) => (
        <StageCard key={`${stage.name}-${i}`} stage={stage} proficiencies={family.proficiencies} />
      ))}
    </ScrollView>
  );
}

function StageCard({ stage, proficiencies }: { stage: PokemonStage; proficiencies: PokemonFamily['proficiencies'] }) {
  return (
    <View style={styles.stageCard}>
      <Text style={styles.stageName}>{stage.name}</Text>
      <View style={styles.badgeRow}>{stage.types.map((t) => <TypeBadge key={t} type={t} />)}</View>
      <Text style={styles.sizeWeight}>{stage.size} · {stage.weight}</Text>

      <View style={styles.statsGrid}>
        <StatBox label="HP" value={stage.stats.hp} />
        <StatBox label="Attack" value={stage.stats.attack} />
        <StatBox label="Defense" value={stage.stats.defense} />
        <StatBox label="Sp. Attack" value={stage.stats.specialAttack} />
        <StatBox label="Sp. Defense" value={stage.stats.specialDefense} />
        <StatBox label="Speed" value={`${stage.stats.speed} (${stage.stats.speedFt}ft)`} />
      </View>

      {stage.skills.length > 0 && (
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Skills</Text>
          {stage.skills.map((s, i) => (
            <Text key={i} style={styles.body}>
              <Text style={styles.bold}>{s.name}</Text> — {s.description}
            </Text>
          ))}
        </View>
      )}

      {stage.passives.length > 0 && (
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Passives</Text>
          {stage.passives.map((p, i) => (
            <Text key={i} style={styles.body}>
              <Text style={styles.bold}>{p.name}</Text> — {p.description}
            </Text>
          ))}
        </View>
      )}

      {proficiencies.length > 0 && (
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Moves by Proficiency</Text>
          {proficiencies.map((prof) => {
            const matches = movesForProficiency(stage.moves, prof);
            return (
              <Text key={prof} style={styles.body}>
                <Text style={styles.bold}>{prof}</Text>
                {matches.length > 0 ? `: ${matches.map((m) => m.name).join(', ')}` : ''}
              </Text>
            );
          })}
        </View>
      )}

      <View style={styles.subSection}>
        <Text style={styles.subTitle}>
          Moves (Atk +{stage.moveModifiers.attack}, SpAtk +{stage.moveModifiers.specialAttack}, Effect +{stage.moveModifiers.effect})
        </Text>
        {stage.moves.map((m, i) => (
          <View key={i} style={styles.move}>
            <Text style={styles.moveName}>
              {m.name} <Text style={styles.moveMeta}>· {m.frequency} · {m.range} · {m.moveType} {m.category}{m.power ? ` · ${m.power}` : ''}</Text>
            </Text>
            {!!m.effect && <Text style={styles.moveEffect}>{m.effect}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800' },
  evolution: { color: colors.textMuted, fontSize: 13, marginBottom: 12 },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  bold: { fontWeight: '700' },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageName: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  sizeWeight: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  statBox: { width: '33%', marginBottom: 8 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  subSection: { marginTop: 8 },
  subTitle: { color: colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  move: { marginBottom: 6 },
  moveName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  moveMeta: { color: colors.textMuted, fontWeight: '400' },
  moveEffect: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
});
