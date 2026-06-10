import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TasteProfileProvider } from './context/TasteProfileContext';
import MainScreen from './screens/MainScreen';
import SwipeScreen from './screens/SwipeScreen';
import { colors } from './theme/theme';
import { TabKey } from './types';

export type RootStackParamList = {
  /** Tab host (Start / FAQ / Taste Profile). `tab` selects which tab to show. */
  Main: { tab?: TabKey } | undefined;
  /** Full-screen swipe flow. */
  Swipe: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Transparent navigation theme so our gradient backgrounds show through and
// there is never a white flash between screens.
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg0, card: colors.bg0, text: colors.text },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <SafeAreaProvider>
        <TasteProfileProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg0 },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="Swipe" options={{ animation: 'slide_from_bottom' }}>
                {({ navigation }) => (
                  <SwipeScreen
                    onBack={() => navigation.navigate('Main', { tab: 'start' })}
                    onSeeProfile={() => navigation.navigate('Main', { tab: 'profile' })}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </TasteProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
