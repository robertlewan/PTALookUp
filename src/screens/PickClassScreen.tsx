import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { trainerClasses } from '../data';

export default function PickClassScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const onPick: (classId: string) => void | Promise<void> = route.params.onPick;
  const [query, setQuery] = useState('');

  const list = trainerClasses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

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
        data={list}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              await onPick(item.id);
              navigation.goBack();
            }}
          >
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>{item.tier === 'base' ? 'Base Class' : 'Advanced Class'}</Text>
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
