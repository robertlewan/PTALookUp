import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import type { CustomMove } from '../types/models';

export default function AddCustomMoveScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const onAdd: (move: CustomMove) => void | Promise<void> = route.params.onAdd;
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [effect, setEffect] = useState('');

  const canSave = name.trim().length > 0 && frequency.trim().length > 0;

  async function save() {
    if (!canSave) return;
    await onAdd({ name: name.trim(), frequency: frequency.trim(), effect: effect.trim() });
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.label}>Move Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Shadow Claw"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Frequency</Text>
      <TextInput
        style={styles.input}
        value={frequency}
        onChangeText={setFrequency}
        placeholder="e.g. At-Will, 3/day, Scene"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={effect}
        onChangeText={setEffect}
        placeholder="What the move does..."
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <TouchableOpacity style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} onPress={save} disabled={!canSave}>
        <Text style={styles.saveBtnText}>Add Move</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primaryMuted, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
