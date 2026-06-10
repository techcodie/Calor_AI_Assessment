import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RootStackParamList } from '../App';
import { BottomNav } from '../components/BottomNav';
import { GradientBackground } from '../components/GradientBackground';
import { SearchOverlay } from '../components/SearchOverlay';
import { TabKey } from '../types';
import FaqScreen from './FaqScreen';
import ResultsScreen from './ResultsScreen';
import StartScreen from './IntroScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

/**
 * Hosts the three bottom-nav tabs (Start / FAQ / Taste Profile) behind a shared
 * gradient background and the glass bottom navigation. The swipe flow lives on
 * its own full-screen route; "Start Swiping" pushes to it, and finishing it
 * navigates back here onto the Taste Profile tab (via the `tab` route param).
 */
export default function MainScreen({ navigation, route }: Props) {
  const [active, setActive] = useState<TabKey>(route.params?.tab ?? 'start');
  const [searchOpen, setSearchOpen] = useState(false);

  // Returning from the swipe flow can request a specific tab (e.g. profile).
  useEffect(() => {
    if (route.params?.tab) setActive(route.params.tab);
  }, [route.params?.tab]);

  return (
    <GradientBackground>
      <View style={styles.root}>
        {/* key forces a fresh fade-in on tab change */}
        <Animated.View key={active} entering={FadeIn.duration(280)} style={styles.screen}>
          {active === 'start' && <StartScreen onStart={() => navigation.navigate('Swipe')} />}
          {active === 'faq' && <FaqScreen />}
          {active === 'profile' && (
            <ResultsScreen onStartSwiping={() => navigation.navigate('Swipe')} />
          )}
        </Animated.View>

        <BottomNav active={active} onChange={setActive} onSearch={() => setSearchOpen(true)} />
      </View>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
});
