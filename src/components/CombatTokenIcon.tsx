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

function Triangle({ width, height, color }: { width: number; height: number; color: string }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: width / 2,
        borderRightWidth: width / 2,
        borderBottomWidth: height,
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
    // Draws an outlined triangle as an outer (white) triangle with a smaller
    // inner (black) triangle offset by a fixed `stroke` on all four sides —
    // width shrinks and height shrinks independently so the border reads as
    // an even ring instead of tapering to nothing at the tip.
    const outerWidth = size;
    const outerHeight = size * 0.87;
    const outerTop = (size - outerHeight) / 2;
    const stroke = Math.max(1.5, size * 0.08);
    const innerWidth = Math.max(0, outerWidth - stroke * 2);
    const innerHeight = Math.max(0, outerHeight - stroke * 2);
    return (
      <View style={{ width: size, height: size }}>
        <View style={{ position: 'absolute', top: outerTop, left: 0 }}>
          <Triangle width={outerWidth} height={outerHeight} color={PAPER} />
        </View>
        <View style={{ position: 'absolute', top: outerTop + stroke, left: stroke }}>
          <Triangle width={innerWidth} height={innerHeight} color={INK} />
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
