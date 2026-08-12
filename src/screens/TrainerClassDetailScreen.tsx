import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { trainerClassById, advancedClassesOf } from '../data';
import { Section, ListRow } from '../components/Section';

export default function TrainerClassDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const cls = trainerClassById.get(route.params.classId);

  if (!cls) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Class not found.</Text>
      </View>
    );
  }

  const parent = cls.parentClassId ? trainerClassById.get(cls.parentClassId) : null;
  const children = cls.tier === 'base' ? advancedClassesOf(cls.id) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.name}>{cls.name}</Text>
      <Text style={styles.tier}>{cls.tier === 'base' ? 'Base Class' : 'Advanced Class'}</Text>
      {parent && (
        <TouchableOpacity onPress={() => navigation.push('ClassDetail', { classId: parent.id })}>
          <Text style={styles.link}>← Part of {parent.name}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.flavor}>{cls.flavorText}</Text>

      {cls.favoredStats && (
        <Section title="Favored Stats">
          <Text style={styles.body}>{cls.favoredStats.join(' and ')}</Text>
        </Section>
      )}

      {cls.skillTalents && (
        <Section title="Skill Talents">
          <Text style={styles.body}>
            Choose {cls.skillTalents.choose}: {cls.skillTalents.options.join(', ')}
          </Text>
        </Section>
      )}

      {children.length > 0 && (
        <Section title="Advanced Classes">
          {children.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => navigation.push('ClassDetail', { classId: c.id })}>
              <Text style={styles.link}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </Section>
      )}

      <Section title="Level Table">
        {cls.levelTable.map((lvl) => (
          <ListRow key={lvl.level} label={`Level ${lvl.level}`} value={lvl.features.join(', ')} />
        ))}
      </Section>

      <Section title="Features">
        {cls.features.map((f, i) => (
          <View key={`${f.name}-${i}`} style={styles.feature}>
            <Text style={styles.featureName}>
              {f.name} <Text style={styles.featureLevel}>(Lvl {f.level})</Text>
            </Text>
            <Text style={styles.featureDesc}>{f.description}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800' },
  tier: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 2, marginBottom: 8, textTransform: 'uppercase' },
  link: { color: colors.accent, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  flavor: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  feature: { marginBottom: 12 },
  featureName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  featureLevel: { color: colors.textMuted, fontWeight: '400', fontSize: 12 },
  featureDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 2 },
});
