import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { baseClasses, advancedClassesOf } from '../data';
import type { TrainerClass } from '../types/models';

type Row = { type: 'base' | 'advanced'; cls: TrainerClass };

export default function TrainerClassListScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const base of baseClasses()) {
      out.push({ type: 'base', cls: base });
      for (const adv of advancedClassesOf(base.id)) {
        out.push({ type: 'advanced', cls: adv });
      }
    }
    if (!query.trim()) return out;
    const q = query.toLowerCase();
    return out.filter((r) => r.cls.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search classes..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.cls.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, item.type === 'advanced' && styles.rowIndent]}
            onPress={() => navigation.navigate('ClassDetail', { classId: item.cls.id })}
          >
            <Text style={styles.rowTitle}>{item.cls.name}</Text>
            <Text style={styles.rowMeta}>{item.type === 'base' ? 'Base Class' : 'Advanced Class'}</Text>
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
  rowIndent: { marginLeft: 20, backgroundColor: colors.surfaceAlt },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
