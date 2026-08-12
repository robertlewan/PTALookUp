import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typeColors } from '../theme/theme';
import { pokemonFamilies } from '../data';
import { TypeBadge } from '../components/TypeBadge';

const ALL_TYPES = Object.keys(typeColors);

export default function PokedexListScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = pokemonFamilies;
    if (activeType) {
      list = list.filter((f) => f.stages.some((s) => s.types.includes(activeType)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => f.familyName.toLowerCase().includes(q));
    }
    return list;
  }, [query, activeType]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search Pokémon..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow} contentContainerStyle={{ paddingHorizontal: 12 }}>
        <TouchableOpacity onPress={() => setActiveType(null)} style={[styles.typeChip, !activeType && styles.typeChipActive]}>
          <Text style={styles.typeChipText}>All</Text>
        </TouchableOpacity>
        {ALL_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveType(activeType === t ? null : t)}
            style={[styles.typeChip, { backgroundColor: typeColors[t] }, activeType === t && styles.typeChipActive]}
          >
            <Text style={styles.typeChipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(f) => f.familyId}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const first = item.stages[0];
          return (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('DexDetail', { familyId: item.familyId })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.familyName}</Text>
                <View style={styles.badgeRow}>{first?.types.map((t) => <TypeBadge key={t} type={t} />)}</View>
              </View>
              {item.rarity && <Text style={styles.rarity}>{item.rarity}</Text>}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No Pokémon match your search.</Text>}
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
  typeRow: { maxHeight: 40, marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  typeChipActive: { borderWidth: 2, borderColor: colors.text },
  typeChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  rarity: { color: colors.textMuted, fontSize: 11 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
