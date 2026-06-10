import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, space } from '../theme/theme';
import { TabKey } from '../types';
import { hapticTap } from '../utils/haptics';
import { GlassView } from './GlassView';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  onSearch: () => void;
}

interface TabDef {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDef[] = [
  { key: 'start', label: 'Start', icon: 'home' },
  { key: 'faq', label: 'FAQ', icon: 'help-circle' },
  { key: 'profile', label: 'Taste Profile', icon: 'nutrition' }, // nutrition = carrot
];

/**
 * Glass bottom navigation matching the Figma: a frosted pill with Start / FAQ /
 * Taste Profile (carrot) tabs, the active one tinted green, beside a separate
 * round search button. Real blur on iOS, translucent fallback elsewhere via the
 * shared GlassView; respects the safe-area inset.
 */
export function BottomNav({ active, onChange, onSearch }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const select = (tab: TabKey) => {
    hapticTap();
    onChange(tab);
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, space.md) }]}
      pointerEvents="box-none"
    >
      <View style={styles.row}>
        {/* Solid (no live blur): this bar floats over the scrolling lists, where a
            real BlurView would re-blur every scroll frame and drop frames. */}
        <GlassView bright style={styles.bar}>
          {TABS.map((def) => (
            <NavTab key={def.key} def={def} active={active === def.key} onPress={() => select(def.key)} />
          ))}
        </GlassView>

        <Pressable
          onPress={() => {
            hapticTap();
            onSearch();
          }}
          hitSlop={8}
        >
          <GlassView bright style={styles.searchBtn}>
            <Ionicons name="search" size={20} color={colors.text} />
          </GlassView>
        </Pressable>
      </View>
    </View>
  );
}

function NavTab({ def, active, onPress }: { def: TabDef; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]} hitSlop={6}>
      <Ionicons name={def.icon} size={20} color={active ? colors.green : colors.textFaint} />
      <Text style={[styles.tabLabel, { color: active ? colors.green : colors.textFaint }]}>
        {def.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    height: 64,
    borderRadius: radius.xxl,
    ...shadow.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  tabActive: { backgroundColor: colors.greenSoft },
  tabLabel: { fontSize: 11, fontWeight: font.semibold },
  searchBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
});
