import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/theme';

export function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export function ListRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  label: { color: colors.textMuted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
