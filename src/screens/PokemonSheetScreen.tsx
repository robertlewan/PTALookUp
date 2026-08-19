import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { getCharacter, saveCharacter } from '../storage/characterStorage';
import { findPokemonStage, pokemonFamilyById, itemById, itemByName, allMoveByName, allPassiveByName, natures, natureByName } from '../data';
import { Section } from '../components/Section';
import { TypeBadge } from '../components/TypeBadge';
import { moveMaxUses, movesForProficiency, remainingUses } from '../utils/moves';
import { applyNature, STAT_LABELS, STAT_FLAVORS } from '../utils/nature';
import { HpInput } from '../components/HpInput';
import type { CharacterSheet, CustomMove, CustomPassive, OwnedPokemon, PokemonMove } from '../types/models';

const COMMON_STATUS = [
  'Bound',
  'Burn',
  'Confused',
  'Dazed',
  'Disabled',
  'Drowsy',
  'Entranced',
  'Frostbite',
  'Paralysis',
  'Poisoned',
  'Toxified',
];

export default function PokemonSheetScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { characterId, pokemonId, location = 'party' }: { characterId: string; pokemonId: string; location?: 'party' | 'box' } =
    route.params;
  const [char, setChar] = useState<CharacterSheet | null>(null);
  const [evolveOpen, setEvolveOpen] = useState(false);

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

  const listKey = location === 'box' ? 'box' : 'party';
  const mon = char[listKey].find((p) => p.id === pokemonId);
  if (!mon) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>This Pokémon is no longer in the {listKey}.</Text>
      </View>
    );
  }

  const ref = findPokemonStage(mon.familyId, mon.stageName);
  const family = pokemonFamilyById.get(mon.familyId);

  async function updateMon(patch: Partial<OwnedPokemon>) {
    if (!char) return;
    const list = char[listKey].map((p) => (p.id === pokemonId ? { ...p, ...patch } : p));
    const next = { ...char, [listKey]: list };
    await saveCharacter(next);
    setChar(next);
  }

  async function removeMon() {
    if (!char) return;
    const list = char[listKey].filter((p) => p.id !== pokemonId);
    const next = { ...char, [listKey]: list };
    await saveCharacter(next);
    setChar(next);
    navigation.goBack();
  }

  async function transferMon() {
    if (!char) return;
    const other = listKey === 'party' ? 'box' : 'party';
    const list = char[listKey].filter((p) => p.id !== pokemonId);
    const otherList = [...char[other], mon!];
    const next = { ...char, [listKey]: list, [other]: otherList };
    await saveCharacter(next);
    navigation.goBack();
  }

  function useMove(move: Pick<PokemonMove, 'name' | 'frequency'>) {
    const max = moveMaxUses(move.frequency);
    if (max === null) return; // At-Will or unparseable frequency: nothing to track
    const current = remainingUses(mon!.moveUses, move) ?? max;
    if (current <= 0) return;
    updateMon({ moveUses: { ...(mon!.moveUses ?? {}), [move.name]: current - 1 } });
  }

  function restoreMove(move: Pick<PokemonMove, 'name' | 'frequency'>) {
    const max = moveMaxUses(move.frequency);
    if (max === null) return;
    const current = remainingUses(mon!.moveUses, move) ?? max;
    if (current >= max) return;
    updateMon({ moveUses: { ...(mon!.moveUses ?? {}), [move.name]: current + 1 } });
  }

  function rest() {
    if (!ref) return;
    const maxHp = ref.stage.stats.hp;
    const healed = Math.round(maxHp / 6);
    updateMon({ moveUses: {}, currentHp: Math.min(maxHp, mon!.currentHp + healed) });
    Alert.alert('Rest', `${mon!.nickname || mon!.stageName} refreshed all move uses and healed ${healed} HP.`);
  }

  function evolveMon(stage: { name: string; stats: { hp: number } }) {
    Alert.alert('Evolve', `Evolve ${mon!.nickname || mon!.stageName} into ${stage.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Evolve',
        onPress: () => {
          setEvolveOpen(false);
          updateMon({ stageName: stage.name, currentHp: Math.min(mon!.currentHp, stage.stats.hp) });
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14 }}>
      <TextInput
        style={styles.nameInput}
        value={mon.nickname}
        onChangeText={(v) => updateMon({ nickname: v })}
        placeholder={mon.stageName}
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.species}>
        {family?.familyName ?? mon.familyId} · {mon.stageName}
      </Text>
      {ref && <View style={styles.badgeRow}>{ref.stage.types.map((t) => <TypeBadge key={t} type={t} />)}</View>}

      {family && family.stages.length > 1 && (
        <>
          <TouchableOpacity style={styles.evolveBtn} onPress={() => setEvolveOpen((o) => !o)}>
            <Text style={styles.evolveBtnText}>{evolveOpen ? 'Cancel Evolve' : '✦ Evolve'}</Text>
          </TouchableOpacity>
          {evolveOpen && (
            <View style={styles.evolveOptions}>
              {family.evolutionText && <Text style={styles.heldItemEffect}>{family.evolutionText}</Text>}
              <View style={styles.skillWrap}>
                {family.stages
                  .filter((s) => s.name !== mon.stageName)
                  .map((s) => (
                    <TouchableOpacity key={s.name} style={styles.skillChip} onPress={() => evolveMon(s)}>
                      <Text style={styles.skillChipText}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </>
      )}

      <Section title="Status">
        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Current HP</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => updateMon({ currentHp: Math.max(0, mon.currentHp - 1) })}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <HpInput value={mon.currentHp} max={ref?.stage.stats.hp} onChange={(v) => updateMon({ currentHp: v })} />
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updateMon({ currentHp: Math.min(ref?.stage.stats.hp ?? Infinity, mon.currentHp + 1) })}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
          {ref && <Text style={styles.maxHp}>/ {ref.stage.stats.hp} max</Text>}
        </View>

        <Text style={styles.stepperLabel}>Status Conditions</Text>
        <View style={styles.skillWrap}>
          {COMMON_STATUS.map((s) => {
            const active = mon.statusConditions.includes(s);
            return (
              <TouchableOpacity
                key={s}
                style={[styles.skillChip, active && styles.skillChipActive]}
                onPress={() =>
                  updateMon({
                    statusConditions: active
                      ? mon.statusConditions.filter((c) => c !== s)
                      : [...mon.statusConditions, s],
                  })
                }
              >
                <Text style={[styles.skillChipText, active && styles.skillChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.stepperLabel}>Held Item</Text>
        <View style={styles.heldItemRow}>
          <Text style={styles.heldItemText}>{mon.heldItem || 'None'}</Text>
          <TouchableOpacity
            style={styles.addBtnSmall}
            onPress={() =>
              navigation.navigate('PickItem', {
                defaultCategory: 'Held Items',
                onPick: async (itemId: string) => {
                  const item = itemById.get(itemId);
                  if (item) updateMon({ heldItem: item.name });
                },
              })
            }
          >
            <Text style={styles.addBtnSmallText}>{mon.heldItem ? 'Change' : 'Set'}</Text>
          </TouchableOpacity>
          {mon.heldItem && (
            <TouchableOpacity style={styles.addBtnSmall} onPress={() => updateMon({ heldItem: null })}>
              <Text style={styles.removeText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {mon.heldItem && itemByName.get(mon.heldItem) && (
          <Text style={styles.heldItemEffect}>{itemByName.get(mon.heldItem)!.effect}</Text>
        )}

        <Text style={styles.stepperLabel}>Nature</Text>
        <View style={styles.skillWrap}>
          {natures.map((n) => {
            const active = mon.nature === n.name;
            return (
              <TouchableOpacity
                key={n.name}
                style={[styles.skillChip, active && styles.skillChipActive]}
                onPress={() => updateMon({ nature: active ? null : n.name })}
              >
                <Text style={[styles.skillChipText, active && styles.skillChipTextActive]}>{n.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {mon.nature && natureByName.get(mon.nature) && (
          <Text style={styles.heldItemEffect}>
            +1 {STAT_LABELS[natureByName.get(mon.nature)!.increasedStat]} ({STAT_FLAVORS[natureByName.get(mon.nature)!.increasedStat]}), −1{' '}
            {STAT_LABELS[natureByName.get(mon.nature)!.decreasedStat]} ({STAT_FLAVORS[natureByName.get(mon.nature)!.decreasedStat]})
          </Text>
        )}
      </Section>

      <Section title="Notes">
        <TextInput
          style={styles.notesInput}
          value={mon.notes}
          onChangeText={(v) => updateMon({ notes: v })}
          multiline
          placeholder="Personality, battle notes..."
          placeholderTextColor={colors.textMuted}
        />
      </Section>

      {ref && (
        <Section title="Dex Reference">
          {(() => {
            const eff = applyNature(ref.stage.stats, mon.nature ? natureByName.get(mon.nature) : null);
            return (
              <Text style={styles.body}>
                Atk {eff.attack} · Def {eff.defense} · SpAtk {eff.specialAttack} · SpDef {eff.specialDefense} · Spd {eff.speed} ({ref.stage.stats.speedFt}ft)
                {mon.nature ? ' (nature-adjusted)' : ''}
              </Text>
            );
          })()}

          {ref.stage.skills.length > 0 && (
            <>
              <Text style={styles.subTitle}>Skills</Text>
              {ref.stage.skills.map((s, i) => (
                <Text key={i} style={styles.body}>
                  <Text style={styles.bold}>{s.name}</Text> — {s.description}
                </Text>
              ))}
            </>
          )}

          {(ref.stage.passives.length > 0 || (mon.extraPassives ?? []).length > 0 || (mon.customPassives ?? []).length > 0) && (
            <>
              <Text style={styles.subTitle}>Passives</Text>
              {ref.stage.passives.map((p, i) => (
                <Text key={i} style={styles.body}>
                  <Text style={styles.bold}>{p.name}</Text> — {p.description}
                </Text>
              ))}
              {(mon.extraPassives ?? []).map((name) => {
                const passive = allPassiveByName.get(name);
                if (!passive) return null;
                return (
                  <View key={name} style={styles.extraPassiveRow}>
                    <Text style={[styles.body, { flex: 1 }]}>
                      <Text style={styles.bold}>{passive.name}</Text> — {passive.description}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateMon({ extraPassives: (mon.extraPassives ?? []).filter((n) => n !== name) })}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {(mon.customPassives ?? []).map((passive, i) => (
                <View key={`custom-${i}`} style={styles.extraPassiveRow}>
                  <Text style={[styles.body, { flex: 1 }]}>
                    <Text style={styles.bold}>{passive.name}</Text>
                    {passive.description ? ` — ${passive.description}` : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateMon({ customPassives: (mon.customPassives ?? []).filter((_, idx) => idx !== i) })}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
          <View style={styles.passiveBtnRow}>
            <TouchableOpacity
              style={styles.addPassiveBtn}
              onPress={() =>
                navigation.navigate('PickPassive', {
                  onPick: async (passiveName: string) => {
                    if (!(mon.extraPassives ?? []).includes(passiveName)) {
                      await updateMon({ extraPassives: [...(mon.extraPassives ?? []), passiveName] });
                    }
                  },
                })
              }
            >
              <Text style={styles.addBtnSmallText}>+ Add Passive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addPassiveBtnSecondary}
              onPress={() =>
                navigation.navigate('AddCustomPassive', {
                  onAdd: async (passive: CustomPassive) => {
                    await updateMon({ customPassives: [...(mon.customPassives ?? []), passive] });
                  },
                })
              }
            >
              <Text style={styles.addPassiveBtnSecondaryText}>+ Add Custom Passive</Text>
            </TouchableOpacity>
          </View>

          {family && family.proficiencies.length > 0 && (
            <>
              <Text style={styles.subTitle}>Proficiencies</Text>
              {family.proficiencies.map((prof) => {
                const matches = movesForProficiency(ref.stage.moves, prof);
                return (
                  <View key={prof} style={{ marginBottom: 6 }}>
                    <Text style={styles.body}>
                      <Text style={styles.bold}>{prof}</Text>
                      {matches.length > 0 ? `: ${matches.map((m) => m.name).join(', ')}` : ''}
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          <View style={styles.movesHeaderRow}>
            <Text style={[styles.subTitle, { marginTop: 8 }]}>Moves</Text>
            <TouchableOpacity style={styles.restBtn} onPress={() => rest()}>
              <Text style={styles.restBtnText}>Rest (refresh moves)</Text>
            </TouchableOpacity>
          </View>
          {ref.stage.moves
            .filter((m) => !(mon.removedMoves ?? []).includes(m.name))
            .map((m, i) => (
              <MoveRow
                key={i}
                move={m}
                moveUses={mon.moveUses}
                onUse={() => useMove(m)}
                onRestore={() => restoreMove(m)}
                onRemove={() => updateMon({ removedMoves: [...(mon.removedMoves ?? []), m.name] })}
              />
            ))}

          {(mon.removedMoves ?? []).length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.removedMovesLabel}>Removed from default moveset:</Text>
              {(mon.removedMoves ?? []).map((name) => (
                <View key={name} style={styles.removedMoveRow}>
                  <Text style={styles.removedMoveText}>{name}</Text>
                  <TouchableOpacity onPress={() => updateMon({ removedMoves: (mon.removedMoves ?? []).filter((n) => n !== name) })}>
                    <Text style={styles.link}>Restore</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {(mon.extraMoves ?? []).map((name) => {
            const move = allMoveByName.get(name);
            if (!move) return null;
            return (
              <MoveRow
                key={name}
                move={move}
                moveUses={mon.moveUses}
                onUse={() => useMove(move)}
                onRestore={() => restoreMove(move)}
                onRemove={() => updateMon({ extraMoves: (mon.extraMoves ?? []).filter((n) => n !== name) })}
              />
            );
          })}

          {(mon.customMoves ?? []).map((move, i) => (
            <MoveRow
              key={`custom-${i}`}
              move={move}
              moveUses={mon.moveUses}
              onUse={() => useMove(move)}
              onRestore={() => restoreMove(move)}
              onRemove={() => updateMon({ customMoves: (mon.customMoves ?? []).filter((_, idx) => idx !== i) })}
            />
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate('PickMove', {
                proficiencies: family?.proficiencies ?? [],
                onPick: async (moveName: string) => {
                  if (!(mon.extraMoves ?? []).includes(moveName)) {
                    await updateMon({ extraMoves: [...(mon.extraMoves ?? []), moveName] });
                  }
                },
              })
            }
          >
            <Text style={styles.addBtnText}>+ Add Move</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtnSecondary}
            onPress={() =>
              navigation.navigate('AddCustomMove', {
                onAdd: async (move: CustomMove) => {
                  await updateMon({ customMoves: [...(mon.customMoves ?? []), move] });
                },
              })
            }
          >
            <Text style={styles.addBtnSecondaryText}>+ Add Custom Move</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('DexTab', { screen: 'DexDetail', params: { familyId: mon.familyId } })}>
            <Text style={styles.link}>View full Pokédex entry →</Text>
          </TouchableOpacity>
        </Section>
      )}

      <TouchableOpacity style={styles.transferBtn} onPress={transferMon}>
        <Text style={styles.transferBtnText}>{listKey === 'party' ? '→ Move to Box' : '→ Move to Party'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={removeMon}>
        <Text style={styles.deleteBtnText}>Remove from {listKey === 'party' ? 'Party' : 'Box'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MoveRow({
  move,
  moveUses,
  onUse,
  onRestore,
  onRemove,
}: {
  move: Pick<PokemonMove, 'name' | 'frequency'> & Partial<Pick<PokemonMove, 'range' | 'moveType' | 'category' | 'power' | 'effect'>>;
  moveUses: Record<string, number> | undefined;
  onUse: () => void;
  onRestore: () => void;
  onRemove?: () => void;
}) {
  const max = moveMaxUses(move.frequency);
  const remaining = remainingUses(moveUses, move);
  const metaParts = [move.frequency, move.range, [move.moveType, move.category].filter(Boolean).join(' ') || null, move.power].filter(
    (p): p is string => !!p
  );

  return (
    <View style={styles.moveRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.body}>
          <Text style={styles.bold}>{move.name}</Text>
          {metaParts.length > 0 ? ` · ${metaParts.join(' · ')}` : ''}
        </Text>
        {!!move.effect && <Text style={styles.moveEffect}>{move.effect}</Text>}
        {onRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      {max !== null && (
        <View style={styles.useBox}>
          <TouchableOpacity style={styles.useStepBtn} onPress={onRestore} disabled={remaining === max}>
            <Text style={[styles.useStepBtnText, remaining === max && styles.useStepBtnTextDisabled]}>+</Text>
          </TouchableOpacity>
          <Text style={styles.useCount}>
            {remaining}/{max}
          </Text>
          <TouchableOpacity style={[styles.useBtn, remaining === 0 && styles.useBtnDisabled]} onPress={onUse} disabled={remaining === 0}>
            <Text style={styles.useBtnText}>Use</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  species: { color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  evolveBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 8 },
  evolveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  evolveOptions: { marginBottom: 12 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepperLabel: { color: colors.textMuted, fontSize: 13, marginRight: 10, minWidth: 90 },
  stepBtn: { backgroundColor: colors.surfaceAlt, width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  stepperValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: 12, minWidth: 24, textAlign: 'center' },
  maxHp: { color: colors.textMuted, fontSize: 12, marginLeft: 8 },
  movesHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restBtn: { backgroundColor: colors.primaryMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6 },
  restBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  addBtn: { backgroundColor: colors.primaryMuted, borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addBtnSecondary: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtnSecondaryText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  moveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  useBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  useStepBtn: { backgroundColor: colors.surfaceAlt, width: 22, height: 22, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  useStepBtnText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  useStepBtnTextDisabled: { color: colors.textMuted },
  useCount: { color: colors.text, fontSize: 12, fontWeight: '700', marginHorizontal: 6, minWidth: 26, textAlign: 'center' },
  useBtn: { backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  useBtnDisabled: { backgroundColor: colors.surfaceAlt },
  useBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  skillChipActive: { backgroundColor: colors.primary },
  skillChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  skillChipTextActive: { color: '#fff' },
  heldItemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  heldItemText: { color: colors.text, fontSize: 14, flex: 1 },
  heldItemEffect: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  addBtnSmall: { backgroundColor: colors.primaryMuted, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  passiveBtnRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 8 },
  addPassiveBtn: { backgroundColor: colors.primaryMuted, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, alignSelf: 'flex-start' },
  addPassiveBtnSecondary: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addPassiveBtnSecondaryText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  extraPassiveRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  addBtnSmallText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  removeText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  bold: { fontWeight: '700' },
  subTitle: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },
  moveEffect: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: 6 },
  removedMovesLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  removedMoveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  removedMoveText: { color: colors.textMuted, fontSize: 13, textDecorationLine: 'line-through' },
  transferBtn: { alignItems: 'center', padding: 12, marginTop: 8 },
  transferBtnText: { color: colors.accent, fontWeight: '700' },
  deleteBtn: { alignItems: 'center', padding: 16, marginBottom: 40 },
  deleteBtnText: { color: '#f87171', fontWeight: '700' },
});
