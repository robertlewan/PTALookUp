import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { getCharacter, saveCharacter, deleteCharacter, newOwnedPokemon } from '../storage/characterStorage';
import { trainerClassById, trainerSkills, pokemonFamilyById, findPokemonStage, itemById } from '../data';
import { Section } from '../components/Section';
import { HpInput } from '../components/HpInput';
import type { CharacterSheet } from '../types/models';

function rollD6() {
  return 1 + Math.floor(Math.random() * 6);
}

// Talents grant +2; taking the same talent a second time bumps it to +5
// (PHB "Talents" rule). Cycle: 0 picks -> 1 (+2) -> 2 (+5) -> 0.
function cycleTalent(skills: string[], name: string): string[] {
  const rank = skills.filter((n) => n === name).length;
  if (rank >= 2) return skills.filter((n) => n !== name);
  return [...skills, name];
}

export default function CharacterSheetScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const characterId: string = route.params.characterId;
  const [char, setChar] = useState<CharacterSheet | null>(null);

  const load = useCallback(() => {
    getCharacter(characterId).then((c) => c && setChar(c));
  }, [characterId]);

  useFocusEffect(load);

  if (!char) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Loading...</Text>
      </View>
    );
  }

  async function update(patch: Partial<CharacterSheet>) {
    if (!char) return;
    const next = { ...char, ...patch };
    await saveCharacter(next);
    setChar(next);
  }

  async function setTrainerLevel(newLevel: number) {
    if (!char) return;
    const delta = newLevel - char.trainerLevel;
    const classes = char.classes.map((c) => ({ ...c, level: Math.max(1, c.level + delta) }));
    await update({ trainerLevel: newLevel, classes });
  }

  async function rest() {
    if (!char) return;
    const trainerHeal = rollD6();
    const party = char.party.map((mon) => {
      const ref = findPokemonStage(mon.familyId, mon.stageName);
      const maxHp = ref?.stage.stats.hp ?? mon.currentHp;
      const healed = Math.round(maxHp / 6);
      return { ...mon, moveUses: {}, currentHp: Math.min(maxHp, mon.currentHp + healed) };
    });
    await update({
      currentHp: Math.min(char.maxHp, char.currentHp + trainerHeal),
      party,
    });
    Alert.alert('Rest (8 hours)', `${char.name || 'Trainer'} healed ${trainerHeal} HP. All Pokémon healed and had their move uses refreshed.`);
  }

  function Stepper({
    label,
    value,
    onChange,
    min = 0,
    max,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
  }) {
    return (
      <View style={styles.stepperBox}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <HpInput value={value} max={max} onChange={onChange} />
          <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <TextInput style={styles.nameInput} value={char.name} onChangeText={(v) => update({ name: v })} placeholder="Trainer name" placeholderTextColor={colors.textMuted} />

      <Section title="Trainer Level">
        <Stepper label="Level" value={char.trainerLevel} min={1} onChange={setTrainerLevel} />
        <Text style={styles.emptyHint}>Leveling up raises every picked class (and subclass) by the same amount.</Text>
      </Section>

      <Section title="Hit Points">
        <View style={styles.hpRow}>
          <Stepper label="Current HP" value={char.currentHp} max={char.maxHp} onChange={(v) => update({ currentHp: v })} />
          <Stepper label="Max HP" value={char.maxHp} min={1} onChange={(v) => update({ maxHp: v })} />
        </View>
        <TouchableOpacity style={styles.restBtn} onPress={rest}>
          <Text style={styles.restBtnText}>Rest (8 hours) — heal & refresh party moves</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Stats">
        <View style={styles.statsGrid}>
          <Stepper label="Attack" value={char.stats.attack} onChange={(v) => update({ stats: { ...char.stats, attack: v } })} />
          <Stepper label="Defense" value={char.stats.defense} onChange={(v) => update({ stats: { ...char.stats, defense: v } })} />
          <Stepper label="Sp. Attack" value={char.stats.specialAttack} onChange={(v) => update({ stats: { ...char.stats, specialAttack: v } })} />
          <Stepper label="Sp. Defense" value={char.stats.specialDefense} onChange={(v) => update({ stats: { ...char.stats, specialDefense: v } })} />
          <Stepper label="Speed" value={char.stats.speed} onChange={(v) => update({ stats: { ...char.stats, speed: v } })} />
        </View>
      </Section>

      <Section title="Trainer Classes">
        {char.classes.map((pick, i) => {
          const cls = trainerClassById.get(pick.classId);
          return (
            <TouchableOpacity
              key={`${pick.classId}-${i}`}
              style={styles.classRow}
              onPress={() => cls && navigation.navigate('ClassDetail', { classId: cls.id })}
            >
              <Text style={styles.classRowText}>{cls?.name ?? pick.classId} · Lvl {pick.level}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  update({ classes: char.classes.filter((_, idx) => idx !== i) });
                }}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate('PickClass', {
              characterId: char.id,
              onPick: async (classId: string) => {
                await update({ classes: [...char.classes, { classId, level: Math.max(1, char.trainerLevel) }] });
              },
            })
          }
        >
          <Text style={styles.addBtnText}>+ Add Class</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Available Features">
        {char.classes.length === 0 && <Text style={styles.emptyHint}>Add a trainer class to see its features here.</Text>}
        {char.classes.map((pick, i) => {
          const cls = trainerClassById.get(pick.classId);
          if (!cls) return null;
          const unlocked = cls.features.filter((f) => f.level <= pick.level);
          if (unlocked.length === 0) return null;
          return (
            <View key={`${pick.classId}-${i}`} style={{ marginBottom: 10 }}>
              <Text style={styles.classGroupLabel}>{cls.name}</Text>
              {unlocked.map((f, fi) => (
                <View key={`${f.name}-${fi}`} style={styles.feature}>
                  <Text style={styles.featureName}>
                    {f.name} <Text style={styles.featureLevel}>(Lvl {f.level})</Text>
                  </Text>
                  <Text style={styles.featureDesc}>{f.description}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </Section>

      <Section title="Skill Talents">
        <Text style={styles.emptyHint}>Tap a talent for +2. Tap again for +5 (taking the same talent twice). Tap a third time to clear it.</Text>
        <View style={styles.skillWrap}>
          {trainerSkills.map((s) => {
            const rank = char.skills.filter((n) => n === s.name).length;
            return (
              <TouchableOpacity
                key={s.name}
                style={[styles.skillChip, rank === 1 && styles.skillChipActive, rank >= 2 && styles.skillChipMax]}
                onPress={() => update({ skills: cycleTalent(char.skills, s.name) })}
              >
                <Text style={[styles.skillChipText, rank > 0 && styles.skillChipTextActive]}>
                  {s.name}
                  {rank === 1 ? ' +2' : rank >= 2 ? ' +5' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Inventory">
        <InventoryEditor items={char.inventory} onChange={(items) => update({ inventory: items })} />
      </Section>

      <Section title="Party">
        {char.party.map((mon) => {
          const family = pokemonFamilyById.get(mon.familyId);
          return (
            <TouchableOpacity
              key={mon.id}
              style={styles.classRow}
              onPress={() => navigation.navigate('PokemonSheet', { characterId: char.id, pokemonId: mon.id })}
            >
              <Text style={styles.classRowText}>
                {mon.nickname || mon.stageName} ({family?.familyName ?? mon.familyId} · {mon.stageName}) · Lvl {mon.level}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate('AddPokemon', {
              characterId: char.id,
              onAdd: async (familyId: string, stageName: string) => {
                await update({ party: [...char.party, newOwnedPokemon(familyId, stageName)] });
              },
            })
          }
        >
          <Text style={styles.addBtnText}>+ Add Pokémon</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Notes">
        <TextInput
          style={styles.notesInput}
          value={char.notes}
          onChangeText={(v) => update({ notes: v })}
          multiline
          placeholder="Backstory, goals, GM notes..."
          placeholderTextColor={colors.textMuted}
        />
      </Section>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={async () => {
          await deleteCharacter(char.id);
          navigation.goBack();
        }}
      >
        <Text style={styles.deleteBtnText}>Delete Character</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InventoryEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const navigation = useNavigation<any>();
  const [text, setText] = useState('');
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.inventoryRow}>
          <Text style={styles.inventoryText}>{item}</Text>
          <TouchableOpacity onPress={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.hpRow}>
        <TextInput
          style={[styles.nameInput, { flex: 1, fontSize: 14, marginBottom: 0 }]}
          placeholder="Add custom item..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => {
            if (text.trim()) {
              onChange([...items, text.trim()]);
              setText('');
            }
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          navigation.navigate('PickItem', {
            onPick: async (itemId: string) => {
              const item = itemById.get(itemId);
              if (item) onChange([...items, item.name]);
            },
          })
        }
      >
        <Text style={styles.addBtnText}>+ Add from Items</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { color: colors.textMuted, padding: 20 },
  nameInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBox: { marginRight: 16, marginBottom: 8 },
  stepperLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  stepperRow: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { backgroundColor: colors.surfaceAlt, width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stepperValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: 12, minWidth: 24, textAlign: 'center' },
  hpRow: { flexDirection: 'row' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  classRowText: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  removeText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
  addBtn: { backgroundColor: colors.primaryMuted, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  restBtn: { backgroundColor: colors.primaryMuted, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  restBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyHint: { color: colors.textMuted, fontSize: 13 },
  classGroupLabel: { color: colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  feature: { marginBottom: 8 },
  featureName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  featureLevel: { color: colors.textMuted, fontWeight: '400', fontSize: 12 },
  featureDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 2 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  skillChipActive: { backgroundColor: colors.primary },
  skillChipMax: { backgroundColor: colors.good },
  skillChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  skillChipTextActive: { color: '#fff' },
  inventoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inventoryText: { color: colors.text, fontSize: 14, flex: 1 },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  deleteBtn: { alignItems: 'center', padding: 16, marginBottom: 40 },
  deleteBtnText: { color: '#f87171', fontWeight: '700' },
});
