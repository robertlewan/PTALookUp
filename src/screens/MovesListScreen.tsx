import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typeColors } from '../theme/theme';
import { allMoves, proficiencyMoveLists } from '../data';
import { movesForProficiency } from '../utils/moves';

// Proficiency tags a move can be looked up by: every Pokemon type, plus the
// three attack-category proficiencies (matches how Trainer/Pokemon
// proficiencies are actually written in the source book).
const PROFICIENCIES = [...Object.keys(typeColors), 'Attack', 'Special Attack', 'Effect'];

// Move-class flavor proficiencies (Bruiser, Floral, Healer, etc.) from the
// PHB's "Proficiency Lists" chapter - these aren't types or attack
// categories, so they're kept in their own filter row.
const MOVE_CLASS_PROFICIENCIES = proficiencyMoveLists.map((l) => l.proficiency).sort();

export default function MovesListScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [activeProficiency, setActiveProficiency] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = activeProficiency ? movesForProficiency(allMoves, activeProficiency) : allMoves;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
  }, [query, activeProficiency]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search moves..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <Text style={styles.filterLabel}>Type / attack-category proficiencies</Text>
      <View style={styles.profWrap}>
        <TouchableOpacity onPress={() => setActiveProficiency(null)} style={[styles.profChip, !activeProficiency && styles.profChipActive]}>
          <Text style={styles.profChipText}>All</Text>
        </TouchableOpacity>
        {PROFICIENCIES.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setActiveProficiency(activeProficiency === p ? null : p)}
            style={[styles.profChip, { backgroundColor: typeColors[p] ?? colors.surfaceAlt }, activeProficiency === p && styles.profChipActive]}
          >
            <Text style={styles.profChipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.filterLabel}>Move-class proficiencies</Text>
      <View style={styles.profWrap}>
        {MOVE_CLASS_PROFICIENCIES.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setActiveProficiency(activeProficiency === p ? null : p)}
            style={[styles.profChip, activeProficiency === p && styles.profChipActive]}
          >
            <Text style={styles.profChipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.name}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('MoveDetail', { moveName: item.name })}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>
              {item.frequency} · {item.range} · {item.moveType ?? 'Typeless'} {item.category}
              {item.power ? ` · ${item.power}` : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No moves match your search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterLabel: { color: colors.textMuted, fontSize: 11, marginHorizontal: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  profWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  profChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  profChipActive: { borderWidth: 2, borderColor: colors.text },
  profChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
