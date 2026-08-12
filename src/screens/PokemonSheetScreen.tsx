import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { getCharacter, saveCharacter } from '../storage/characterStorage';
import { findPokemonStage, pokemonFamilyById } from '../data';
import { Section } from '../components/Section';
import { TypeBadge } from '../components/TypeBadge';
import type { CharacterSheet, OwnedPokemon } from '../types/models';

const COMMON_STATUS = ['Poisoned', 'Burned', 'Paralyzed', 'Asleep', 'Frozen', 'Confused'];

export default function PokemonSheetScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { characterId, pokemonId }: { characterId: string; pokemonId: string } = route.params;
  const [char, setChar] = useState<CharacterSheet | null>(null);

  const load = useCallback(() => {
    getCharacter(characterId).then((c) => c && setChar(c));
  }, [characterId]);

  useFocusEffect(load);

  if (!char) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Loading...</Text>
      </View>
    );
  }

  const mon = char.party.find((p) => p.id === pokemonId);
  if (!mon) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>This Pokémon is no longer in the party.</Text>
      </View>
    );
  }

  const ref = findPokemonStage(mon.familyId, mon.stageName);
  const family = pokemonFamilyById.get(mon.familyId);

  async function updateMon(patch: Partial<OwnedPokemon>) {
    if (!char) return;
    const party = char.party.map((p) => (p.id === pokemonId ? { ...p, ...patch } : p));
    const next = { ...char, party };
    await saveCharacter(next);
    setChar(next);
  }

  async function removeMon() {
    if (!char) return;
    const party = char.party.filter((p) => p.id !== pokemonId);
    const next = { ...char, party };
    await saveCharacter(next);
    setChar(next);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <TextInput
        style={styles.nameInput}
        value={mon.nickname}
        onChangeText={(v) => updateMon({ nickname: v })}
        placeholder={mon.stageName}
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.species}>
        {family?.familyName ?? mon.familyId} · {mon.stageName}
      </Text>
      {ref && <View style={styles.badgeRow}>{ref.stage.types.map((t) => <TypeBadge key={t} type={t} />)}</View>}

      <Section title="Status">
        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Level</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => updateMon({ level: Math.max(1, mon.level - 1) })}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{mon.level}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => updateMon({ level: mon.level + 1 })}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Current HP</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => updateMon({ currentHp: Math.max(0, mon.currentHp - 1) })}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{mon.currentHp}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => updateMon({ currentHp: mon.currentHp + 1 })}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
          {ref && <Text style={styles.maxHp}>/ {ref.stage.stats.hp} max</Text>}
        </View>

        <Text style={styles.stepperLabel}>Status Conditions</Text>
        <View style={styles.skillWrap}>
          {COMMON_STATUS.map((s) => {
            const active = mon.statusConditions.includes(s);
            return (
              <TouchableOpacity
                key={s}
                style={[styles.skillChip, active && styles.skillChipActive]}
                onPress={() =>
                  updateMon({
                    statusConditions: active
                      ? mon.statusConditions.filter((c) => c !== s)
                      : [...mon.statusConditions, s],
                  })
                }
              >
                <Text style={[styles.skillChipText, active && styles.skillChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Notes">
        <TextInput
          style={styles.notesInput}
          value={mon.notes}
          onChangeText={(v) => updateMon({ notes: v })}
          multiline
          placeholder="Personality, held items, battle notes..."
          placeholderTextColor={colors.textMuted}
        />
      </Section>

      {ref && (
        <Section title="Dex Reference">
          <Text style={styles.body}>
            Atk {ref.stage.stats.attack} · Def {ref.stage.stats.defense} · SpAtk {ref.stage.stats.specialAttack} · SpDef{' '}
            {ref.stage.stats.specialDefense} · Spd {ref.stage.stats.speed} ({ref.stage.stats.speedFt}ft)
          </Text>
          {ref.stage.passives.length > 0 && (
            <>
              <Text style={styles.subTitle}>Passives</Text>
              {ref.stage.passives.map((p, i) => (
                <Text key={i} style={styles.body}>
                  <Text style={styles.bold}>{p.name}</Text> — {p.description}
                </Text>
              ))}
            </>
          )}
          <Text style={styles.subTitle}>Moves</Text>
          {ref.stage.moves.map((m, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.body}>
                <Text style={styles.bold}>{m.name}</Text> · {m.frequency} · {m.range} · {m.moveType} {m.category}
                {m.power ? ` · ${m.power}` : ''}
              </Text>
              {!!m.effect && <Text style={styles.moveEffect}>{m.effect}</Text>}
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('DexTab', { screen: 'DexDetail', params: { familyId: mon.familyId } })}>
            <Text style={styles.link}>View full Pokédex entry →</Text>
          </TouchableOpacity>
        </Section>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={removeMon}>
        <Text style={styles.deleteBtnText}>Remove from Party</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { color: colors.textMuted, padding: 20 },
  nameInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  species: { color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepperLabel: { color: colors.textMuted, fontSize: 13, marginRight: 10, minWidth: 90 },
  stepBtn: { backgroundColor: colors.surfaceAlt, width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stepperValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: 12, minWidth: 24, textAlign: 'center' },
  maxHp: { color: colors.textMuted, fontSize: 12, marginLeft: 8 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  skillChipActive: { backgroundColor: colors.primary },
  skillChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  skillChipTextActive: { color: '#fff' },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  bold: { fontWeight: '700' },
  subTitle: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },
  moveEffect: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: 6 },
  deleteBtn: { alignItems: 'center', padding: 16, marginBottom: 40 },
  deleteBtnText: { color: '#f87171', fontWeight: '700' },
});
