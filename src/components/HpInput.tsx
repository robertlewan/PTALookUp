import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/theme';

// A tappable numeric value that can be typed into directly, for HP (or any
// stepper value) where nudging with +/- one at a time is too slow after a
// big damage roll or heal.
export function HpInput({ value, max, onChange }: { value: number; max?: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit() {
    const n = parseInt(text, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.max(0, max !== undefined ? Math.min(max, n) : n);
      onChange(clamped);
      setText(String(clamped));
    } else {
      setText(String(value));
    }
  }

  return (
    <TextInput
      style={styles.input}
      value={text}
      onChangeText={setText}
      onBlur={commit}
      onSubmitEditing={commit}
      keyboardType="number-pad"
      selectTextOnFocus
    />
  );
}

const styles = StyleSheet.create({
  input: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
