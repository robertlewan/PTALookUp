import React from 'react';
import { Text, View } from 'react-native';
import type { CombatTokenKind } from '../types/models';

const EMOJI: Partial<Record<CombatTokenKind, string>> = {
  tree: '🌲',
  rock: '🪨',
  water: '🌊',
};

const INK = '#0b0d10';
const PAPER = '#f2f4f7';

function Triangle({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size / 2,
        borderRightWidth: size / 2,
        borderBottomWidth: size * 0.87,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }}
    />
  );
}

// Renders one of the fixed combat-map token glyphs at the requested pixel size.
export function CombatTokenIcon({ kind, size }: { kind: CombatTokenKind; size: number }) {
  if (kind === 'circle-black' || kind === 'circle-white') {
    const white = kind === 'circle-white';
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: white ? PAPER : INK,
          borderWidth: 1.5,
          borderColor: white ? INK : PAPER,
        }}
      />
    );
  }

  if (kind === 'square-black' || kind === 'square-white') {
    const white = kind === 'square-white';
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 3,
          backgroundColor: white ? PAPER : INK,
          borderWidth: 1.5,
          borderColor: white ? INK : PAPER,
        }}
      />
    );
  }

  if (kind === 'triangle-black') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute' }}>
          <Triangle size={size} color={PAPER} />
        </View>
        <View style={{ position: 'absolute', top: 2.5 }}>
          <Triangle size={size - 5} color={INK} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.82, lineHeight: size * 0.95 }}>{EMOJI[kind]}</Text>
    </View>
  );
}
