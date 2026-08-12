import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { itemById } from '../data';

export default function ItemDetailScreen() {
  const route = useRoute<any>();
  const item = itemById.get(route.params.itemId);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Item not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.price}>{item.price ? `${item.price} P` : 'Not purchasable'}</Text>
      <Text style={styles.effect}>{item.effect}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { color: colors.textMuted, padding: 20 },
  name: { color: colors.text, fontSize: 26, fontWeight: '800' },
  category: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  price: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 16 },
  effect: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
