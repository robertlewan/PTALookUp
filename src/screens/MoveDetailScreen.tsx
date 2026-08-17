import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { allMoveByName } from '../data';
import { TypeBadge } from '../components/TypeBadge';
import { proficienciesForMove } from '../utils/moves';

export default function MoveDetailScreen() {
  const route = useRoute<any>();
  const move = allMoveByName.get(route.params.moveName);

  if (!move) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Move not found.</Text>
      </View>
    );
  }

  const proficiencies = proficienciesForMove(move);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.name}>{move.name}</Text>
      <View style={styles.badgeRow}>
        {move.moveType && <TypeBadge type={move.moveType} />}
        <Text style={styles.category}>{move.category}</Text>
      </View>
      <Text style={styles.meta}>
        {move.frequency} · {move.range}
        {move.power ? ` · ${move.power}` : ''}
      </Text>
      <Text style={styles.effect}>{move.effect}</Text>

      {proficiencies.length > 0 && (
        <>
          <Text style={styles.subTitle}>Proficiencies</Text>
          <View style={styles.profWrap}>
            {proficiencies.map((p) => (
              <View key={p} style={styles.profChip}>
                <Text style={styles.profChipText}>{p}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  category: { color: colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 6, textTransform: 'uppercase' },
  meta: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 16 },
  effect: { color: colors.text, fontSize: 15, lineHeight: 22 },
  subTitle: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 18, marginBottom: 8, textTransform: 'uppercase' },
  profWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  profChip: { backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  profChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
});
