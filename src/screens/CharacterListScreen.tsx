import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { listCharacters, saveCharacter, deleteCharacter, newCharacter } from '../storage/characterStorage';
import type { CharacterSheet } from '../types/models';

export default function CharacterListScreen() {
  const navigation = useNavigation<any>();
  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const [newName, setNewName] = useState('');

  const load = useCallback(() => {
    listCharacters().then(setCharacters);
  }, []);

  useFocusEffect(load);

  async function handleCreate() {
    const name = newName.trim() || 'New Trainer';
    const char = newCharacter(name);
    await saveCharacter(char);
    setNewName('');
    load();
    navigation.navigate('CharacterSheet', { characterId: char.id });
  }

  function handleDelete(id: string, name: string) {
    Alert.alert('Delete Character', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCharacter(id);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          placeholder="New trainer name..."
          placeholderTextColor={colors.textMuted}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleCreate}
        />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={characters}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('CharacterSheet', { characterId: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>
                Level {item.trainerLevel} · {item.party.length} Pokémon · HP {item.currentHp}/{item.maxHp}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item.id, item.name);
              }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No characters yet. Create one above.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  createRow: { flexDirection: 'row', padding: 12, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  createBtnText: { color: '#fff', fontWeight: '700' },
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
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteBtnText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
