import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from '../components/GlassView';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTasteProfile } from '../context/TasteProfileContext';
import { colors, font, gradients, radius, space } from '../theme/theme';
import { Food, NutritionAnalysis } from '../types';
import { hapticTap } from '../utils/haptics';
import { computeCuisines, computeNutrition, computeProfile } from '../utils/profile';
import { healthRating } from '../utils/nutrition';

const NAV_SPACE = 120;
const PAGE_W = Dimensions.get('window').width - space.xl * 2;

interface ResultsScreenProps {
  /** Launch (or relaunch) the swipe flow. */
  onStartSwiping: () => void;
}

/** The "Taste Profile" tab: a personalised summary of the user's swipes. */
export default function ResultsScreen({ onStartSwiping }: ResultsScreenProps) {
  const { likes, dislikes, loves, superlikes, hates, unsures, reset } = useTasteProfile();
  const profile = useMemo(() => computeProfile(likes, dislikes), [likes, dislikes]);
  const nutrition = useMemo(() => computeNutrition(likes, dislikes), [likes, dislikes]);
  const cuisines = useMemo(() => computeCuisines(likes), [likes]);

  const startOver = () => {
    hapticTap();
    reset();
    onStartSwiping();
  };

  // Nothing loved yet -> nudge the user into the deck.
  if (likes.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.screenTitle}>Your Taste Profile</Text>
        <View style={styles.emptyWrap}>
          <GlassView blur style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No profile yet</Text>
            <Text style={styles.emptyText}>
              Swipe through a few foods to build your taste profile and unlock your
              recommendations.
            </Text>
            <View style={styles.emptyButton}>
              <PrimaryButton label="Start Swiping" icon="arrow-forward" onPress={onStartSwiping} />
            </View>
          </GlassView>
        </View>
      </SafeAreaView>
    );
  }

  // Key highlights: archetype, top cuisine, top flavour trait — all from real swipes.
  const highlights = [
    { emoji: profile.emoji, label: profile.archetype.replace(/^The /, '') },
    ...(profile.topCuisine ? [{ emoji: profile.topCuisine.emoji, label: profile.topCuisine.name }] : []),
    ...(profile.traits[0] ? [{ emoji: profile.traits[0].emoji, label: profile.traits[0].label }] : []),
  ].slice(0, 3);

  // Each page is its own swipeable card. Within a page, verdicts are grouped and
  // ordered: Most Liked (super) before Liked, and No before Not Sure.
  const pages: CarouselPage[] = [
    {
      key: 'love',
      emoji: '❤️',
      title: `Foods You Love (${likes.length})`,
      sub: "We'll recommend these",
      rows: (
        <>
          {superlikes.length > 0 && (
            <FoodGroup label="Most Liked" icon="star" color={colors.superlike} foods={superlikes} />
          )}
          {loves.length > 0 && (
            <FoodGroup label="Liked" icon="heart" color={colors.blue} foods={loves} />
          )}
        </>
      ),
    },
    ...(hates.length + unsures.length > 0
      ? [
          {
            key: 'pass',
            emoji: '🙅',
            title: `Not For You (${hates.length + unsures.length})`,
            sub: 'Skipped and unsure picks',
            rows: (
              <>
                {hates.length > 0 && (
                  <FoodGroup label="No" icon="close" color={colors.dislike} foods={hates} />
                )}
                {unsures.length > 0 && (
                  <FoodGroup label="Not Sure" icon="help" color={colors.notsure} foods={unsures} />
                )}
              </>
            ),
          },
        ]
      : []),
    ...(cuisines.length > 0
      ? [
          {
            key: 'cuisines',
            emoji: '🤤',
            title: 'Your Favorite Cuisines',
            sub: 'Flavors you love, all in one place',
            rows: cuisines.map((c, i) => (
              <View key={c.name} style={[styles.listRow, i > 0 && styles.listDivider]}>
                <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
                <Text style={styles.listName}>{c.name}</Text>
                <Text style={styles.listMeta}>{c.count} matches</Text>
              </View>
            )),
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Your Taste Profile</Text>
        <Text style={styles.subtitle}>
          Tailored to your unique needs. We'll use this for recommendations and meal plans.
        </Text>

        {/* Key Highlights */}
        <Animated.View entering={FadeInDown.duration(260)}>
          <Text style={styles.keyLabel}>Key Highlights</Text>
          <GlassView style={styles.highlightsCard}>
            {highlights.map((h, i) => (
              <React.Fragment key={h.label}>
                {i > 0 && <View style={styles.hlDivider} />}
                <View style={styles.hlCol}>
                  <Text style={styles.hlEmoji}>{h.emoji}</Text>
                  <View style={styles.hlLabelBox}>
                    <Text style={styles.hlLabel} numberOfLines={2}>
                      {h.label}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </GlassView>
        </Animated.View>

        {/* Nutrition analysis (tailored insight) */}
        <Animated.View entering={FadeInDown.delay(80).duration(260)}>
          <NutritionDashboard data={nutrition} />
        </Animated.View>

        {/* Foods You Love / Hate / Cuisines — separate paged cards (Figma) */}
        <Animated.View entering={FadeInDown.delay(160).duration(260)}>
          <ListsCarousel pages={pages} />
        </Animated.View>

        {/* Start over */}
        <Animated.View entering={FadeInDown.delay(220).duration(260)} style={styles.restartWrap}>
          <PrimaryButton label="Start over" icon="refresh" onPress={startOver} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface CarouselPage {
  key: string;
  emoji: string;
  title: string;
  sub: string;
  rows: React.ReactNode;
}

/**
 * Foods You Love / Foods You Hate / Favorite Cuisines as separate swipeable
 * cards with pagination dots — matching the Figma. Horizontal paging lives
 * happily inside the vertical results ScrollView (different axes don't fight).
 */
function ListsCarousel({ pages }: { pages: CarouselPage[] }) {
  const [active, setActive] = useState(0);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / PAGE_W);
    if (i !== active) setActive(i);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        decelerationRate="fast"
      >
        {pages.map((page) => (
          <View key={page.key} style={{ width: PAGE_W }}>
            <SectionHead emoji={page.emoji} title={page.title} sub={page.sub} />
            <GlassView style={styles.listCard}>{page.rows}</GlassView>
          </View>
        ))}
      </ScrollView>

      {pages.length > 1 && (
        <View style={styles.dots}>
          {pages.map((p, i) => (
            <View key={p.key} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

function SectionHead({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        <Text style={styles.sectionSub}>{sub}</Text>
      </View>
    </View>
  );
}

/** A labelled group of foods inside a carousel page (e.g. "Most Liked"). */
function FoodGroup({
  label,
  icon,
  color,
  foods,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  foods: Food[];
}) {
  return (
    <View>
      <Text style={styles.groupLabel}>
        {label} · {foods.length}
      </Text>
      {foods.map((food, i) => (
        <ListRow
          key={food.id}
          first={i === 0}
          icon={icon}
          color={color}
          name={food.name}
          meta={`${food.calories} cal`}
        />
      ))}
    </View>
  );
}

function ListRow({
  icon,
  color,
  name,
  meta,
  first,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  name: string;
  meta?: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.listRow, !first && styles.listDivider]}>
      <View style={[styles.listIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={13} color={colors.white} />
      </View>
      <Text style={styles.listName}>{name}</Text>
      {meta ? <Text style={styles.listMeta}>{meta}</Text> : null}
    </View>
  );
}

function SectionTitle({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.nutritionTitle}>
      <Ionicons name={icon} size={16} color={colors.green} />
      <Text style={styles.nutritionTitleText}>{text}</Text>
    </View>
  );
}

/** One-line read on how wholesome the user's likes are overall. */
function healthVerdict(score: number): string {
  if (score >= 85) return 'Your palate leans seriously clean.';
  if (score >= 70) return 'Your picks lean healthy and balanced.';
  if (score >= 50) return 'A balanced mix of wholesome and indulgent.';
  return 'You gravitate to rich, indulgent flavours.';
}

/** Calorie comfort zone, health balance, and standout picks. */
function NutritionDashboard({ data }: { data: NutritionAnalysis }) {
  if (data.avgCalories === 0) return null;
  const health = healthRating(data.avgHealth);

  return (
    <>
      <SectionTitle icon="analytics" text="Nutrition analysis" />

      <GlassView style={styles.analysisCard}>
        <View style={styles.analysisHead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.analysisLabel}>Calorie comfort zone</Text>
            <Text style={styles.analysisBig}>
              {data.avgCalories}
              <Text style={styles.analysisUnit}> cal</Text>
            </Text>
            <Text style={styles.analysisSub}>average in the foods you love</Text>
          </View>
          <View style={styles.flameBadge}>
            <Ionicons name="flame" size={22} color={colors.flame} />
          </View>
        </View>
        <View style={styles.analysisDivider} />
        <View style={styles.miniStatRow}>
          <MiniStat label="Lightest" value={`${data.minCalories}`} />
          <MiniStat label="Richest" value={`${data.maxCalories}`} />
          <MiniStat label="3-dish day" value={`≈${data.estimatedDay}`} />
        </View>
      </GlassView>

      <GlassView style={styles.analysisCard}>
        <Text style={styles.analysisLabel}>Health balance</Text>
        <View style={styles.healthHeadRow}>
          <Text style={[styles.analysisBig, { color: health.color }]}>
            {data.avgHealth}
            <Text style={styles.analysisUnit}>/100</Text>
          </Text>
          <View style={[styles.verdictPill, { borderColor: health.color }]}>
            <View style={[styles.healthDot, { backgroundColor: health.color }]} />
            <Text style={[styles.verdictText, { color: health.color }]}>{health.label}</Text>
          </View>
        </View>
        <View style={styles.healthTrack}>
          <View style={[styles.healthFill, { width: `${data.avgHealth}%`, backgroundColor: health.color }]} />
        </View>
        <Text style={styles.analysisSub}>{healthVerdict(data.avgHealth)}</Text>
        {data.healthierThanSkipped !== null && (
          <Text
            style={[styles.compareText, { color: data.healthierThanSkipped ? colors.green : colors.amber }]}
          >
            {data.healthierThanSkipped
              ? '↑ Healthier than the foods you skipped'
              : '↓ A bit richer than the foods you skipped'}
          </Text>
        )}
      </GlassView>

      {data.healthiest && data.mostIndulgent && (
        <View style={styles.pickRow}>
          <PickCard food={data.healthiest} tag="Healthiest" color={colors.green} metric={`${data.healthiest.healthScore}/100`} />
          <PickCard food={data.mostIndulgent} tag="Most indulgent" color={colors.amber} metric={`${data.mostIndulgent.calories} cal`} />
        </View>
      )}
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function PickCard({ food, tag, color, metric }: { food: Food; tag: string; color: string; metric: string }) {
  return (
    <View style={styles.pickCard}>
      <Image source={food.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
      <LinearGradient colors={gradients.cardScrim} style={StyleSheet.absoluteFill} />
      <View style={[styles.pickTag, { backgroundColor: color }]}>
        <Text style={styles.pickTagText}>{tag}</Text>
      </View>
      <View style={styles.pickFooter}>
        <Text style={styles.pickName} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.pickMetric, { color }]}>{metric}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: space.xl },
  scroll: { paddingBottom: NAV_SPACE },
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: font.black,
    letterSpacing: -0.5,
    marginTop: space.sm,
  },
  subtitle: { color: colors.textDim, fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: space.lg },

  // Key highlights
  keyLabel: { color: colors.textDim, fontSize: 13, fontWeight: font.semibold, marginBottom: space.sm },
  highlightsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: space.lg,
  },
  hlCol: { flex: 1, alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs },
  hlEmoji: { fontSize: 30 },
  // Fixed two-line box so 1- and 2-line labels line up across the three columns.
  hlLabelBox: { height: 34, justifyContent: 'center' },
  hlLabel: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: font.bold,
    textAlign: 'center',
  },
  hlDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.10)' },

  // Section heads
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  sectionEmoji: { fontSize: 22 },
  sectionTitleText: { color: colors.text, fontSize: 17, fontWeight: font.bold },
  sectionSub: { color: colors.textDim, fontSize: 13, marginTop: 1 },

  // Lists
  listCard: { borderRadius: radius.lg, paddingHorizontal: space.lg },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  listDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)' },
  listIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: { color: colors.text, fontSize: 15, fontWeight: font.semibold, flex: 1 },
  listMeta: { color: colors.textDim, fontSize: 13, fontWeight: font.medium },
  groupLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: font.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: space.md,
    marginBottom: 2,
  },
  cuisineEmoji: { fontSize: 22, width: 24, textAlign: 'center' },

  // Carousel pagination dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: space.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)' },
  dotActive: { width: 20, backgroundColor: colors.green },

  restartWrap: { marginTop: space.xxl },

  // Empty state
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: NAV_SPACE },
  emptyCard: { width: '100%', borderRadius: radius.xxl, padding: space.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: space.md },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: font.black },
  emptyText: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: space.sm,
  },
  emptyButton: { width: '100%', marginTop: space.xl },

  // Nutrition analysis dashboard
  nutritionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  nutritionTitleText: { color: colors.text, fontSize: 17, fontWeight: font.bold },
  analysisCard: { borderRadius: radius.lg, padding: space.lg, marginBottom: space.md },
  analysisHead: { flexDirection: 'row', alignItems: 'flex-start' },
  analysisLabel: { color: colors.textDim, fontSize: 13, fontWeight: font.semibold, letterSpacing: 0.3 },
  analysisBig: { color: colors.text, fontSize: 34, fontWeight: font.black, marginTop: 2, letterSpacing: -1 },
  analysisUnit: { fontSize: 15, fontWeight: font.bold, color: colors.textDim },
  analysisSub: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  flameBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,159,69,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: space.md },
  miniStatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  miniStat: { alignItems: 'center', flex: 1 },
  miniStatValue: { color: colors.text, fontSize: 17, fontWeight: font.black },
  miniStatLabel: { color: colors.textFaint, fontSize: 11, fontWeight: font.medium, marginTop: 2 },
  healthHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: space.md,
  },
  verdictPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  verdictText: { fontSize: 13, fontWeight: font.bold },
  healthDot: { width: 7, height: 7, borderRadius: 4 },
  healthTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  healthFill: { height: '100%', borderRadius: radius.pill },
  compareText: { fontSize: 12.5, fontWeight: font.semibold, marginTop: space.sm },
  pickRow: { flexDirection: 'row', gap: space.md, marginBottom: space.md },
  pickCard: {
    flex: 1,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg2,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  pickTagText: { color: colors.bg0, fontSize: 10.5, fontWeight: font.black, letterSpacing: 0.3 },
  pickFooter: { padding: space.md },
  pickName: { color: colors.text, fontSize: 14, fontWeight: font.bold },
  pickMetric: { fontSize: 12, fontWeight: font.bold, marginTop: 1 },
});
