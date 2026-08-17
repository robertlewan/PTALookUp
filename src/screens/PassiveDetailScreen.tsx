import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { allPassiveByName, familiesForPassiveName } from '../data';

export default function PassiveDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const passive = allPassiveByName.get(route.params.passiveName);
  const families = familiesForPassiveName.get(route.params.passiveName) ?? [];

  if (!passive) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Passive not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.name}>{passive.name}</Text>
      <Text style={styles.effect}>{passive.description}</Text>

      <Text style={styles.subTitle}>Known By ({families.length})</Text>
      {families.length === 0 ? (
        <Text style={styles.empty}>No Pokémon family has this passive natively — it may only be available via a tutor or temporary effect.</Text>
      ) : (
        families
          .slice()
          .sort((a, b) => a.familyName.localeCompare(b.familyName))
          .map((f) => (
            <TouchableOpacity
              key={f.familyId}
              style={styles.familyRow}
              onPress={() => navigation.navigate('DexTab', { screen: 'DexDetail', params: { familyId: f.familyId } })}
            >
              <Text style={styles.familyName}>{f.familyName}</Text>
              <Text style={styles.familyStages}>{f.stages.join(', ')}</Text>
            </TouchableOpacity>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  effect: { color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  subTitle: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 18, marginBottom: 8, textTransform: 'uppercase' },
  empty: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  familyRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  familyName: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  familyStages: { color: colors.textMuted, fontSize: 12 },
});
