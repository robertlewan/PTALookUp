import React, { useCallback, useRef, useState } from 'react';
import { Alert, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/theme';
import { getCombatMap, saveCombatMap } from '../storage/combatStorage';
import { CombatTokenIcon } from '../components/CombatTokenIcon';
import { HpInput } from '../components/HpInput';
import type { CombatMap, CombatToken, CombatTokenKind } from '../types/models';

const CELL_SIZE = 36;
const LABEL_SIZE = 26;
const MIN_DIM = 1;
const MAX_DIM = 40;

const PALETTE: { kind: CombatTokenKind; label: string }[] = [
  { kind: 'circle-black', label: 'Black Circle' },
  { kind: 'circle-white', label: 'White Circle' },
  { kind: 'square-black', label: 'Black Square' },
  { kind: 'square-white', label: 'White Square' },
  { kind: 'triangle-black', label: 'Black Triangle' },
  { kind: 'tree', label: 'Tree' },
  { kind: 'rock', label: 'Rock' },
  { kind: 'water', label: 'Water' },
];

const SIZES: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

// Spreadsheet-style column labels: A, B, ... Z, AA, AB, ...
function colLabel(index: number): string {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function rectContains(t: CombatToken, row: number, col: number) {
  return row >= t.row && row < t.row + t.size && col >= t.col && col < t.col + t.size;
}

function rectsOverlap(t: CombatToken, other: { row: number; col: number; size: number }) {
  return (
    t.row < other.row + other.size &&
    t.row + t.size > other.row &&
    t.col < other.col + other.size &&
    t.col + t.size > other.col
  );
}

const DRAG_THRESHOLD = 4;
const LONG_PRESS_MS = 550;

// A placed token that can be tapped (apply current brush), dragged to a new
// cell (snaps to the grid on release), or long-pressed to rename. Refs hold
// the latest props/callbacks so the single long-lived PanResponder never
// closes over stale data.
function TokenView({
  token,
  cellSize,
  onTap,
  onMove,
  onRename,
}: {
  token: CombatToken;
  cellSize: number;
  onTap: (token: CombatToken) => void;
  onMove: (token: CombatToken, newRow: number, newCol: number) => void;
  onRename: (token: CombatToken) => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onRenameRef = useRef(onRename);
  onRenameRef.current = onRename;

  const dragging = useRef(false);
  const longPressFired = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > DRAG_THRESHOLD || Math.abs(g.dy) > DRAG_THRESHOLD,
      onPanResponderGrant: () => {
        dragging.current = false;
        longPressFired.current = false;
        longPressTimer.current = setTimeout(() => {
          if (!dragging.current) {
            longPressFired.current = true;
            onRenameRef.current(tokenRef.current);
          }
        }, LONG_PRESS_MS);
      },
      onPanResponderMove: (_e, g) => {
        if (!dragging.current && (Math.abs(g.dx) > DRAG_THRESHOLD || Math.abs(g.dy) > DRAG_THRESHOLD)) {
          dragging.current = true;
          clearLongPress();
        }
        if (dragging.current) setOffset({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_e, g) => {
        clearLongPress();
        if (dragging.current) {
          const dCol = Math.round(g.dx / cellSize);
          const dRow = Math.round(g.dy / cellSize);
          setOffset({ x: 0, y: 0 });
          if (dCol !== 0 || dRow !== 0) {
            const t = tokenRef.current;
            onMoveRef.current(t, t.row + dRow, t.col + dCol);
          }
        } else if (!longPressFired.current) {
          onTapRef.current(tokenRef.current);
        }
        dragging.current = false;
      },
      onPanResponderTerminate: () => {
        clearLongPress();
        setOffset({ x: 0, y: 0 });
        dragging.current = false;
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: token.col * cellSize + offset.x,
        top: token.row * cellSize + offset.y,
        width: token.size * cellSize,
        height: token.size * cellSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CombatTokenIcon kind={token.kind} size={token.size * cellSize - 6} />
      {token.label ? (
        <View style={styles.tokenLabelWrap} pointerEvents="none">
          <Text style={styles.tokenLabelText} numberOfLines={1}>
            {token.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function CombatScreen() {
  const [map, setMap] = useState<CombatMap | null>(null);
  const [brush, setBrush] = useState<CombatTokenKind | 'eraser'>('circle-black');
  const [brushSize, setBrushSize] = useState<1 | 2 | 3 | 4>(1);
  const [renaming, setRenaming] = useState<{ id: string; text: string } | null>(null);

  const load = useCallback(() => {
    getCombatMap().then(setMap);
  }, []);

  useFocusEffect(load);

  if (!map) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Loading...</Text>
      </View>
    );
  }

  async function update(patch: Partial<CombatMap>) {
    if (!map) return;
    const next = { ...map, ...patch };
    await saveCombatMap(next);
    setMap(next);
  }

  function setRows(n: number) {
    if (!map) return;
    const rows = clamp(n, MIN_DIM, MAX_DIM);
    update({ rows, tokens: map.tokens.filter((t) => t.row + t.size <= rows) });
  }

  function setCols(n: number) {
    if (!map) return;
    const cols = clamp(n, MIN_DIM, MAX_DIM);
    update({ cols, tokens: map.tokens.filter((t) => t.col + t.size <= cols) });
  }

  function isCircleBrush(b: CombatTokenKind | 'eraser'): b is 'circle-black' | 'circle-white' {
    return b === 'circle-black' || b === 'circle-white';
  }

  function handleCellPress(row: number, col: number) {
    if (!map) return;

    if (brush === 'eraser') {
      update({ tokens: map.tokens.filter((t) => !rectContains(t, row, col)) });
      return;
    }

    const size = isCircleBrush(brush) ? brushSize : 1;
    const r0 = clamp(row, 0, map.rows - size);
    const c0 = clamp(col, 0, map.cols - size);

    const existingSame = map.tokens.find(
      (t) => t.kind === brush && t.size === size && t.row === r0 && t.col === c0
    );

    let tokens: CombatToken[];
    if (existingSame) {
      tokens = map.tokens.filter((t) => t.id !== existingSame.id);
    } else {
      const rect = { row: r0, col: c0, size };
      tokens = map.tokens.filter((t) => !rectsOverlap(t, rect));
      tokens.push({
        id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        kind: brush,
        row: r0,
        col: c0,
        size,
      });
    }
    update({ tokens });
  }

  function handleTokenTap(token: CombatToken) {
    handleCellPress(token.row, token.col);
  }

  function handleTokenMove(token: CombatToken, newRow: number, newCol: number) {
    if (!map) return;
    const size = token.size;
    const r0 = clamp(newRow, 0, map.rows - size);
    const c0 = clamp(newCol, 0, map.cols - size);
    if (r0 === token.row && c0 === token.col) return;

    const rect = { row: r0, col: c0, size };
    const tokens = map.tokens
      .filter((t) => t.id === token.id || !rectsOverlap(t, rect))
      .map((t) => (t.id === token.id ? { ...t, row: r0, col: c0 } : t));
    update({ tokens });
  }

  function handleTokenRename(token: CombatToken) {
    setRenaming({ id: token.id, text: token.label ?? '' });
  }

  function commitRename() {
    if (!renaming || !map) return;
    const text = renaming.text.trim();
    const tokens = map.tokens.map((t) => (t.id === renaming.id ? { ...t, label: text || undefined } : t));
    update({ tokens });
    setRenaming(null);
  }

  function handleClear() {
    Alert.alert('Clear Grid', 'Remove all tokens from the map?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => update({ tokens: [] }) },
    ]);
  }

  const gridWidth = map.cols * CELL_SIZE;
  const gridHeight = map.rows * CELL_SIZE;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <View style={styles.sizeRow}>
          <View style={styles.stepperBox}>
            <Text style={styles.stepperLabel}>Rows</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setRows(map.rows - 1)}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <HpInput value={map.rows} max={MAX_DIM} onChange={setRows} />
              <TouchableOpacity style={styles.stepBtn} onPress={() => setRows(map.rows + 1)}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.stepperBox}>
            <Text style={styles.stepperLabel}>Columns</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCols(map.cols - 1)}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <HpInput value={map.cols} max={MAX_DIM} onChange={setCols} />
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCols(map.cols + 1)}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Clear Grid</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Tokens</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteRow}>
          {PALETTE.map((p) => (
            <TouchableOpacity
              key={p.kind}
              style={[styles.paletteItem, brush === p.kind && styles.paletteItemActive]}
              onPress={() => setBrush(p.kind)}
            >
              <CombatTokenIcon kind={p.kind} size={26} />
              <Text style={styles.paletteLabel}>{p.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.paletteItem, brush === 'eraser' && styles.paletteItemActive]}
            onPress={() => setBrush('eraser')}
          >
            <Text style={styles.eraserGlyph}>✕</Text>
            <Text style={styles.paletteLabel}>Eraser</Text>
          </TouchableOpacity>
        </ScrollView>

        {isCircleBrush(brush) && (
          <>
            <Text style={styles.sectionLabel}>Token Size</Text>
            <View style={styles.sizeSelectorRow}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeItem, brushSize === s && styles.sizeItemActive]}
                  onPress={() => setBrushSize(s)}
                >
                  <Text style={styles.sizeItemText}>
                    {s}×{s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Map</Text>
        <Text style={styles.mapHint}>
          Tap a cell to place the selected tool. Tap a token to apply the tool there too. Press and drag a token to
          move it. Long-press a token to rename it.
        </Text>
        <ScrollView horizontal contentContainerStyle={{ paddingBottom: 12 }}>
          <View>
            {/* Column header row */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: LABEL_SIZE, height: LABEL_SIZE }} />
              {Array.from({ length: map.cols }).map((_, c) => (
                <View key={c} style={[styles.headerCell, { width: CELL_SIZE, height: LABEL_SIZE }]}>
                  <Text style={styles.headerText}>{colLabel(c)}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row' }}>
              {/* Row header column */}
              <View>
                {Array.from({ length: map.rows }).map((_, r) => (
                  <View key={r} style={[styles.headerCell, { width: LABEL_SIZE, height: CELL_SIZE }]}>
                    <Text style={styles.headerText}>{r + 1}</Text>
                  </View>
                ))}
              </View>

              {/* Grid body: background lines, token overlay, touch layer */}
              <View style={{ width: gridWidth, height: gridHeight }}>
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  {Array.from({ length: map.rows }).map((_, r) => (
                    <View key={r} style={{ flexDirection: 'row' }}>
                      {Array.from({ length: map.cols }).map((_, c) => (
                        <View key={c} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE }]} />
                      ))}
                    </View>
                  ))}
                </View>

                <View style={StyleSheet.absoluteFill}>
                  {Array.from({ length: map.rows }).map((_, r) => (
                    <View key={r} style={{ flexDirection: 'row' }}>
                      {Array.from({ length: map.cols }).map((_, c) => (
                        <TouchableOpacity
                          key={c}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          onPress={() => handleCellPress(r, c)}
                        />
                      ))}
                    </View>
                  ))}
                </View>

                <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                  {map.tokens.map((t) => (
                    <TokenView
                      key={t.id}
                      token={t}
                      cellSize={CELL_SIZE}
                      onTap={handleTokenTap}
                      onMove={handleTokenMove}
                      onRename={handleTokenRename}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      <Modal visible={!!renaming} transparent animationType="none" onRequestClose={() => setRenaming(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rename Token</Text>
            <TextInput
              style={styles.modalInput}
              value={renaming?.text ?? ''}
              onChangeText={(v) => setRenaming((r) => (r ? { ...r, text: v } : r))}
              placeholder="e.g. Boulder, Grunt #2..."
              placeholderTextColor={colors.textMuted}
              autoFocus
              onSubmitEditing={commitRename}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setRenaming(null)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={commitRename}>
                <Text style={styles.modalBtnTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { color: colors.textMuted, padding: 20 },
  sizeRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap' },
  stepperBox: { marginRight: 16, marginBottom: 8 },
  stepperLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  stepperRow: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { backgroundColor: colors.surfaceAlt, width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  clearBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearBtnText: { color: '#f87171', fontWeight: '700', fontSize: 13 },
  sectionLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  paletteRow: { marginBottom: 14 },
  paletteItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    minWidth: 68,
  },
  paletteItemActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  paletteLabel: { color: colors.textMuted, fontSize: 10, marginTop: 6, textAlign: 'center' },
  eraserGlyph: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sizeSelectorRow: { flexDirection: 'row', marginBottom: 14 },
  sizeItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  sizeItemActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  sizeItemText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  headerCell: { alignItems: 'center', justifyContent: 'center' },
  headerText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  cell: { borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  mapHint: { color: colors.textMuted, fontSize: 11, marginBottom: 8, lineHeight: 15 },
  tokenLabelWrap: {
    position: 'absolute',
    bottom: -13,
    alignSelf: 'center',
    backgroundColor: 'rgba(16,19,24,0.9)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 96,
  },
  tokenLabelText: { color: colors.text, fontSize: 9, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surfaceAlt },
  modalBtnText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  modalBtnPrimary: { backgroundColor: colors.primary },
  modalBtnTextPrimary: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
