import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { allMoves } from '../data';

export default function PickMoveScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onPick: (moveName: string) => void | Promise<void> = route.params.onPick;
  const proficiencies: string[] = route.params.proficiencies ?? [];
  const [query, setQuery] = useState('');

  const isProficient = (moveType: string) => proficiencies.some((p) => p.toLowerCase() === moveType.toLowerCase());

  const filtered = useMemo(() => {
    if (!query.trim()) return allMoves;
    const q = query.toLowerCase();
    return allMoves.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search moves..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <Text style={styles.hint}>
        Dimmed moves aren't in this Pokémon's proficiencies — still pickable, but a GM may want to weigh in.
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.name}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const proficient = isProficient(item.moveType);
          return (
            <TouchableOpacity
              style={[styles.row, !proficient && styles.rowDim]}
              onPress={async () => {
                await onPick(item.name);
                navigation.goBack();
              }}
            >
              <Text style={[styles.rowTitle, !proficient && styles.rowTitleDim]}>{item.name}</Text>
              <Text style={styles.rowMeta}>
                {item.frequency} · {item.range} · {item.moveType} {item.category}
                {item.power ? ` · ${item.power}` : ''}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No moves match your search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: 12,
    marginBottom: 4,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { color: colors.textMuted, fontSize: 12, marginHorizontal: 12, marginBottom: 4 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowDim: { opacity: 0.5 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rowTitleDim: { textDecorationLine: 'line-through' },
  rowMeta: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
