import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { gmGuideSections } from '../data';

export default function GmGuideDetailScreen() {
  const route = useRoute<any>();
  const section = gmGuideSections.find((s) => s.id === route.params.sectionId);

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Section not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>{section.title}</Text>
      <Text style={styles.body}>{section.body}</Text>

      {section.table && (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {section.table.columns.map((col, i) => (
              <Text key={i} style={[styles.tableCell, styles.tableHeaderCell]}>
                {col}
              </Text>
            ))}
          </View>
          {section.table.rows.map((row, ri) => (
            <View key={ri} style={[styles.tableRow, ri % 2 === 1 && styles.tableRowAlt]}>
              {row.map((cell, ci) => (
                <Text key={ci} style={styles.tableCell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  table: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', backgroundColor: colors.surface },
  tableRowAlt: { backgroundColor: colors.surfaceAlt },
  tableCell: { flex: 1, color: colors.text, fontSize: 13, padding: 10, textAlign: 'center' },
  tableHeaderCell: { fontWeight: '700', color: colors.primary },
});
