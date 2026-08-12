import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { typeColors } from '../theme/theme';

export function TypeBadge({ type }: { type: string }) {
  const bg = typeColors[type] ?? '#666';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
