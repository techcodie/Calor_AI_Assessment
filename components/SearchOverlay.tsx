import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import foodsData from '../data/foods.json';
import { colors, font, radius, space } from '../theme/theme';
import { Food } from '../types';
import { hapticTap } from '../utils/haptics';
import { healthRating } from '../utils/nutrition';

const ALL_FOODS = foodsData.foods as Food[];

interface SearchOverlayProps {
  onClose: () => void;
}

/** Food lookup: filter the catalogue, then tap any result to open its details. */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_FOODS;
    return ALL_FOODS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
      {/* Tap-outside: in detail view, return to the list; otherwise close. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={selected ? () => setSelected(null) : onClose} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {selected ? (
          <FoodDetail food={selected} onBack={() => setSelected(null)} />
        ) : (
          <Animated.View entering={FadeInDown.duration(220)} style={styles.panel}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.textDim} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Search foods…"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                returnKeyType="search"
              />
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={20} color={colors.textDim} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {results.length === 0 ? (
                <Text style={styles.empty}>No foods match "{query}"</Text>
              ) : (
                results.map((food) => {
                  const health = healthRating(food.healthScore);
                  return (
                    <Pressable
                      key={food.id}
                      style={styles.row}
                      onPress={() => {
                        hapticTap();
                        setSelected(food);
                      }}
                    >
                      <Image source={food.image} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{food.name}</Text>
                        <Text style={styles.meta}>
                          {food.calories} cal · <Text style={{ color: health.color }}>{health.label}</Text>
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

/** Detail view for a single food, opened from a search result. */
function FoodDetail({ food, onBack }: { food: Food; onBack: () => void }) {
  const health = healthRating(food.healthScore);
  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.panel}>
      <View style={styles.detailTop}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.detailIconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.detailTopTitle}>Food details</Text>
        <View style={styles.detailIconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
        <Image source={food.image} style={styles.detailImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
        <Text style={styles.detailName}>{food.name}</Text>

        <View style={styles.detailPills}>
          <View style={styles.detailPill}>
            <Ionicons name="flame" size={14} color={colors.flame} />
            <Text style={styles.detailPillText}>{food.calories} cal</Text>
          </View>
          <View style={styles.detailPill}>
            <Text style={styles.detailPillText}>{String(food.category)}</Text>
          </View>
        </View>

        <View style={styles.detailBlock}>
          <View style={styles.detailRowBetween}>
            <Text style={styles.detailLabel}>How good for you</Text>
            <Text style={[styles.detailScore, { color: health.color }]}>
              {health.label} · {food.healthScore}/100
            </Text>
          </View>
          <View style={styles.detailTrack}>
            <View style={[styles.detailFill, { width: `${food.healthScore}%`, backgroundColor: health.color }]} />
          </View>
        </View>

        <Text style={[styles.detailLabel, styles.detailTagsLabel]}>Tags</Text>
        <View style={styles.detailTags}>
          {food.tags.map((t) => (
            <View key={t} style={styles.detailTag}>
              <Text style={styles.detailTagText}>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,10,0.94)', zIndex: 50 },
  safe: { flex: 1, paddingHorizontal: space.xl },
  panel: { flex: 1, marginTop: space.md },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.glassFillAndroid,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: space.md,
    height: 50,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: font.medium },
  list: { paddingVertical: space.lg, gap: space.sm },
  empty: { color: colors.textDim, fontSize: 15, textAlign: 'center', marginTop: space.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.glassFill,
    borderRadius: radius.md,
    padding: space.sm,
  },
  thumb: { width: 46, height: 46, borderRadius: radius.sm, backgroundColor: colors.bg2 },
  name: { color: colors.text, fontSize: 15, fontWeight: font.bold },
  meta: { color: colors.textDim, fontSize: 13, marginTop: 2, fontWeight: font.medium },

  // Detail view
  detailTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  detailIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassFill,
  },
  detailTopTitle: { color: colors.text, fontSize: 16, fontWeight: font.bold },
  detailScroll: { paddingTop: space.lg, paddingBottom: space.xxxl },
  detailImage: { width: '100%', height: 220, borderRadius: radius.xl, backgroundColor: colors.bg2 },
  detailName: { color: colors.text, fontSize: 28, fontWeight: font.black, letterSpacing: -0.5, marginTop: space.lg },
  detailPills: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailPillText: { color: colors.text, fontSize: 13, fontWeight: font.bold, textTransform: 'capitalize' },
  detailBlock: { marginTop: space.xl, gap: space.sm },
  detailRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: colors.textDim, fontSize: 13, fontWeight: font.semibold },
  detailTagsLabel: { marginTop: space.xl, marginBottom: space.sm },
  detailScore: { fontSize: 13, fontWeight: font.bold },
  detailTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glassFillStrong,
    overflow: 'hidden',
  },
  detailFill: { height: '100%', borderRadius: radius.pill },
  detailTags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  detailTag: {
    backgroundColor: colors.glassFill,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailTagText: { color: colors.text, fontSize: 13, fontWeight: font.medium },
});
