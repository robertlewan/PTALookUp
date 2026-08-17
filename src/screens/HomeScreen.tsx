import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { trainerClasses, pokemonFamilies } from '../data';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const baseCount = trainerClasses.filter((c) => c.tier === 'base').length;
  const advCount = trainerClasses.filter((c) => c.tier === 'advanced').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>PTA Lookup</Text>
      <Text style={styles.subtitle}>Pokémon Tabletop Adventures companion</Text>

      <View style={styles.statsRow}>
        <Stat label="Base Classes" value={baseCount} />
        <Stat label="Advanced Classes" value={advCount} />
        <Stat label="Pokémon Families" value={pokemonFamilies.length} />
      </View>

      <NavCard
        title="Trainer Classes"
        desc="Browse base and advanced trainer classes, favored stats, and level-by-level features."
        onPress={() => navigation.navigate('ClassesTab')}
      />
      <NavCard
        title="Pokédex"
        desc="Look up Pokémon families, stats, skills, passives, and full move lists."
        onPress={() => navigation.navigate('DexTab')}
      />
      <NavCard
        title="Characters"
        desc="Create and save trainer character sheets, and manage your Pokémon party."
        onPress={() => navigation.navigate('CharactersTab')}
      />
      <NavCard
        title="GM Guide"
        desc="Capture rates, encounter building, loyalty, evolution, and other game master reference rules."
        onPress={() => navigation.navigate('GmGuideTab')}
      />
      <NavCard
        title="Items"
        desc="Poké Balls, medical items, held items, berries, TMs, and other gear."
        onPress={() => navigation.navigate('ItemsTab')}
      />
      <NavCard
        title="Moves"
        desc="Look up any of the game's moves, filterable by type or proficiency."
        onPress={() => navigation.navigate('MovesTab')}
      />
      <NavCard
        title="Passives"
        desc="Browse every Pokémon passive and see which families know it."
        onPress={() => navigation.navigate('PassivesTab')}
      />
      <NavCard
        title="Combat"
        desc="A lettered/numbered battle grid — place circle, square, triangle, and terrain tokens for encounters."
        onPress={() => navigation.navigate('CombatTab')}
      />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavCard({ title, desc, onPress }: { title: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
