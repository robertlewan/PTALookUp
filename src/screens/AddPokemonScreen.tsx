import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { pokemonFamilies } from '../data';

type Row = { familyId: string; familyName: string; stageName: string };

export default function AddPokemonScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const onAdd: (familyId: string, stageName: string) => void | Promise<void> = route.params.onAdd;
  const [query, setQuery] = useState('');

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const f of pokemonFamilies) {
      for (const s of f.stages) {
        out.push({ familyId: f.familyId, familyName: f.familyName, stageName: s.name });
      }
    }
    if (!query.trim()) return out;
    const q = query.toLowerCase();
    return out.filter((r) => r.stageName.toLowerCase().includes(q) || r.familyName.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search species..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={rows}
        keyExtractor={(r) => `${r.familyId}-${r.stageName}`}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              await onAdd(item.familyId, item.stageName);
              navigation.goBack();
            }}
          >
            <Text style={styles.rowTitle}>{item.stageName}</Text>
            {item.stageName !== item.familyName && <Text style={styles.rowMeta}>{item.familyName} family</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: 12,
    marginBottom: 0,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
