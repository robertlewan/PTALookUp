import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { items } from '../data';

const ALL_CATEGORIES = [...new Set(items.map((i) => i.category))];

export default function ItemsListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onPick: ((itemId: string) => void | Promise<void>) | undefined = route.params?.onPick;
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(route.params?.defaultCategory ?? null);

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory) {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [query, activeCategory]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search items..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.categoryRow}>
        <TouchableOpacity onPress={() => setActiveCategory(null)} style={[styles.categoryChip, !activeCategory && styles.categoryChipActive]}>
          <Text style={styles.categoryChipText}>All</Text>
        </TouchableOpacity>
        {ALL_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setActiveCategory(activeCategory === c ? null : c)}
            style={[styles.categoryChip, activeCategory === c && styles.categoryChipActive]}
          >
            <Text style={styles.categoryChipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              if (onPick) {
                await onPick(item.id);
                navigation.goBack();
              } else {
                navigation.navigate('ItemDetail', { itemId: item.id });
              }
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.category}</Text>
            </View>
            <Text style={styles.price}>{item.price ? `${item.price}P` : '—'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items match your search.</Text>}
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
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
  rowMeta: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 8 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
