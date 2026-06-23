# Lumia 2026 — Volledige Broncode

> Dit bestand bevat de complete broncode van alle kernbestanden van het Lumia project.

---

## Inhoudsopgave

1. [constants/colors.ts](#1-constantscolorsts)
2. [app/_layout.tsx](#2-app_layouttsx)
3. [app/(tabs)/_layout.tsx](#3-apptabs_layouttsx)
4. [app/(tabs)/index.tsx — Home](#4-apptabsindextsx--home)
5. [app/(tabs)/dashboard.tsx](#5-apptabsdashboardtsx)
6. [app/onboarding.tsx](#6-apponboardingtsx)
7. [context/LumiaContext.tsx](#7-contextlumiacontexttsx)
8. [components/DualGlowBackground.tsx](#8-componentsdualglowbackgroundtsx)
9. [components/GlassPanel.tsx](#9-componentsglassaneltsx)
10. [components/MeterCard.tsx](#10-componentsmetercardtsx)
11. [components/LivingGarden.tsx](#11-componentslivingardentsx)
12. [API: routes/lumia.ts](#12-api-routeslumitats)
13. [API: lib/insforge.ts](#13-api-libinsforgets)
14. [API: index.ts](#14-api-indexts)

---

## 1. constants/colors.ts

```typescript
export const COLORS = {
  bg: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',

  silver: '#C0C8D8',
  silverDim: 'rgba(192,200,216,0.6)',
  silverBorder: 'rgba(192,200,216,0.18)',
  silverGlow: 'rgba(220,230,255,0.12)',

  emerald: '#00E07A',
  emeraldDim: 'rgba(0,224,122,0.6)',
  emeraldBorder: 'rgba(0,224,122,0.25)',
  emeraldGlow: 'rgba(0,224,122,0.10)',

  honor: '#FFD700',
  honorGlow: 'rgba(255,215,0,0.25)',
  shame: '#A855F7',
  shameGlow: 'rgba(168,85,247,0.25)',
  vitality: '#00E07A',
  vitalityGlow: 'rgba(0,224,122,0.25)',
  decay: '#EF4444',
  decayGlow: 'rgba(239,68,68,0.25)',

  textPrimary: '#F0F4FF',
  textSecondary: 'rgba(240,244,255,0.6)',
  textMuted: 'rgba(240,244,255,0.35)',

  xpGold: '#FFD700',
  xpPurple: '#A855F7',

  white: '#FFFFFF',
  black: '#000000',
};

export default {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.bg,
    tint: COLORS.emerald,
    tabIconDefault: COLORS.silverDim,
    tabIconSelected: COLORS.emerald,
  },
};
```

---

## 2. app/_layout.tsx

```tsx
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceGrotesk,
} from "@expo-google-fonts/space-grotesk";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  useFonts as useOutfit,
} from "@expo-google-fonts/outfit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LumiaProvider, useLumia } from "@/context/LumiaContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding } = useLumia();

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace("/onboarding");
    }
  }, [hasCompletedOnboarding]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <OnboardingGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="profile/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="statement/create" options={{ presentation: "modal" }} />
        <Stack.Screen name="transparency/[meter]" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin" options={{ presentation: "card" }} />
        <Stack.Screen name="settings" options={{ presentation: "card" }} />
        <Stack.Screen name="help" options={{ presentation: "card" }} />
        <Stack.Screen name="privacy" options={{ presentation: "card" }} />
        <Stack.Screen name="terms" options={{ presentation: "card" }} />
        <Stack.Screen name="about" options={{ presentation: "card" }} />
      </Stack>
    </OnboardingGate>
  );
}

export default function RootLayout() {
  const [sgLoaded, sgError] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const [outfitLoaded, outfitError] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  const fontsLoaded = sgLoaded && outfitLoaded;
  const fontError = sgError || outfitError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LumiaProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </LumiaProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
```

---

## 3. app/(tabs)/_layout.tsx

```tsx
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useLumia } from "@/context/LumiaContext";

function NotifBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={{
      position: "absolute", top: -4, right: -8,
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: COLORS.decay,
      alignItems: "center", justifyContent: "center",
      paddingHorizontal: 3, borderWidth: 1.5, borderColor: COLORS.bg,
    }}>
      <Text style={{ color: "#fff", fontSize: 9, fontFamily: "SpaceGrotesk_700Bold" }}>
        {count > 9 ? "9+" : count}
      </Text>
    </View>
  );
}

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="social">
        <Icon sf={{ default: "bubble.left.and.bubble.right", selected: "bubble.left.and.bubble.right.fill" }} />
        <Label>Social</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inbox">
        <Icon sf={{ default: "envelope", selected: "envelope.fill" }} />
        <Label>Inbox</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Icon sf={{ default: "bell", selected: "bell.fill" }} />
        <Label>Meldingen</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();
  const { unreadNotifCount } = useLumia();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: "rgba(192,200,216,0.5)",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "rgba(10,10,10,0.95)",
          borderTopWidth: 1,
          borderTopColor: COLORS.silverBorder,
          elevation: 0,
          paddingBottom: insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, {
              backgroundColor: "rgba(10,10,10,0.95)",
              borderTopColor: COLORS.silverBorder, borderTopWidth: 1,
            }]} />
          ) : null,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: "Home",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="house" tintColor={color} size={22} />
          : <Ionicons name="home-outline" size={22} color={color} />,
      }} />
      <Tabs.Screen name="social" options={{
        title: "Social",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="bubble.left.and.bubble.right" tintColor={color} size={22} />
          : <Ionicons name="chatbubbles-outline" size={22} color={color} />,
      }} />
      <Tabs.Screen name="inbox" options={{
        title: "Inbox",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="envelope" tintColor={color} size={22} />
          : <Feather name="mail" size={22} color={color} />,
      }} />
      <Tabs.Screen name="notifications" options={{
        title: "Meldingen",
        tabBarIcon: ({ color }) => (
          <View style={{ position: "relative" }}>
            {isIOS
              ? <SymbolView name="bell" tintColor={color} size={22} />
              : <Ionicons name="notifications-outline" size={22} color={color} />}
            <NotifBadge count={unreadNotifCount} />
          </View>
        ),
      }} />
      <Tabs.Screen name="dashboard" options={{
        title: "Dashboard",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="chart.bar" tintColor={color} size={22} />
          : <Ionicons name="bar-chart-outline" size={22} color={color} />,
      }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
```

---

## 4. app/(tabs)/index.tsx — Home

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { LivingGarden } from "@/components/LivingGarden";
import { MeterCard } from "@/components/MeterCard";
import { useLumia } from "@/context/LumiaContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { meters, user, xpLog } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 90;

  return (
    <DualGlowBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Lumia</Text>
            <Text style={styles.brandSub}>Elite Trust Platform</Text>
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (user.isAdmin) router.push("/admin"); }}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}
          >
            <LinearGradient colors={["rgba(0,224,122,0.3)", "rgba(192,200,216,0.2)"]} style={styles.avatarGrad}>
              <Text style={styles.avatarEmoji}>{user.avatar}</Text>
            </LinearGradient>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{(user.xp / 1000).toFixed(1)}k</Text>
            </View>
          </Pressable>
        </View>

        {/* XP Level bar */}
        <GlassPanel style={styles.levelPanel}>
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelLabel}>Level {user.level}</Text>
              <Text style={styles.xpLabel}>{user.xp.toLocaleString()} XP</Text>
            </View>
            <View style={styles.levelBarOuter}>
              <LinearGradient
                colors={[COLORS.emerald, COLORS.silver]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.levelBarFill, { width: `${(user.xp % 1000) / 10}%` }]}
              />
            </View>
          </View>
        </GlassPanel>

        {/* 4 Meters */}
        <Text style={styles.sectionTitle}>Trust Meters</Text>
        <View style={styles.metersGrid}>
          <MeterCard type="honor" value={meters.honor} />
          <MeterCard type="reflectie" value={meters.reflectie} />
          <MeterCard type="vitality" value={meters.vitality} />
          <MeterCard type="decay" value={meters.decay} />
        </View>

        {/* Living Garden */}
        <Text style={styles.sectionTitle}>Living Garden</Text>
        <GlassPanel variant="emerald" style={styles.gardenPanel}>
          <LivingGarden />
        </GlassPanel>

        {/* XP Logboek preview */}
        <Text style={styles.sectionTitle}>XP Logboek</Text>
        <GlassPanel style={styles.logPanel}>
          {xpLog.slice(0, 5).map((entry, i) => (
            <View key={entry.id} style={[styles.logEntry, i > 0 && styles.logEntryBorder]}>
              <View style={styles.logLeft}>
                <View style={[styles.logDot, {
                  backgroundColor:
                    entry.category === "honor" ? COLORS.honor :
                    entry.category === "reflectie" ? COLORS.shame :
                    entry.category === "vitality" ? COLORS.vitality :
                    entry.category === "decay" ? COLORS.decay : COLORS.silver,
                }]} />
                <Text style={styles.logAction} numberOfLines={1}>{entry.action}</Text>
              </View>
              <Text style={[styles.logXP, { color: entry.xp > 0 ? COLORS.emerald : COLORS.decay }]}>
                {entry.xp > 0 ? "+" : ""}{entry.xp} XP
              </Text>
            </View>
          ))}
          <Pressable style={styles.viewAllBtn} onPress={() => router.push("/dashboard")}>
            <Text style={styles.viewAllText}>Alles bekijken</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.emerald} />
          </Pressable>
        </GlassPanel>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  brandName: { fontSize: 36, color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", letterSpacing: -1 },
  brandSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: "Outfit_400Regular", letterSpacing: 0.5, marginTop: -2 },
  avatarBtn: { position: "relative" },
  avatarGrad: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.emeraldBorder },
  avatarEmoji: { fontSize: 24 },
  xpBadge: { position: "absolute", bottom: -4, right: -4, backgroundColor: COLORS.emerald, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  xpText: { color: "#000", fontSize: 9, fontFamily: "SpaceGrotesk_700Bold" },
  levelPanel: { padding: 14, marginBottom: 20 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelLabel: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  xpLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
  levelBarOuter: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  levelBarFill: { height: "100%", borderRadius: 3 },
  sectionTitle: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  metersGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  gardenPanel: { padding: 16, marginBottom: 20 },
  logPanel: { padding: 0, marginBottom: 20, overflow: "hidden" },
  logEntry: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  logEntryBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, flex: 1 },
  logXP: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  viewAllText: { color: COLORS.emerald, fontFamily: "Outfit_500Medium", fontSize: 13 },
});
```

---

## 5. app/(tabs)/dashboard.tsx

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";

const HISTORY = [
  { week: "W1", honor: 55, vitality: 70 },
  { week: "W2", honor: 60, vitality: 75 },
  { week: "W3", honor: 65, vitality: 80 },
  { week: "W4", honor: 70, vitality: 85 },
  { week: "W5", honor: 72, vitality: 88 },
  { week: "W6", honor: 76, vitality: 91 },
];

function BarChart({ data, color }: { data: { week: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 70 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <View style={{ width: "100%", height: (d.value / max) * 60, backgroundColor: color + "30", borderRadius: 4, borderWidth: 1, borderColor: color + "60", overflow: "hidden" }}>
            <LinearGradient colors={[color + "80", color + "20"]} style={{ flex: 1 }} />
          </View>
          <Text style={{ color: COLORS.textMuted, fontSize: 9, fontFamily: "Outfit_400Regular" }}>{d.week}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { meters, xpLog, user, friends } = useLumia();
  const [previewProfile, setPreviewProfile] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 90;
  const totalXP = xpLog.reduce((sum, e) => sum + e.xp, 0);

  return (
    <DualGlowBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSub}>Project: LUMIA_2026</Text>
          </View>
          {user.isAdmin && (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/admin"); }} style={styles.adminBtn}>
              <Ionicons name="settings-outline" size={18} color={COLORS.silver} />
            </Pressable>
          )}
        </View>

        {/* Profile card */}
        <GlassPanel style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              <View style={styles.profileAvatarContainer}>
                <Text style={styles.profileAvatarEmoji}>{user.avatar}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileLevel}>Level {user.level} • {user.xp.toLocaleString()} XP</Text>
              </View>
            </View>
            <Pressable onPress={() => { setPreviewProfile(!previewProfile); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={[styles.previewBtn, previewProfile && styles.previewBtnActive]}>
              <Ionicons name={previewProfile ? "eye" : "eye-outline"} size={16} color={previewProfile ? COLORS.emerald : COLORS.silver} />
              <Text style={[styles.previewText, previewProfile && { color: COLORS.emerald }]}>Preview</Text>
            </Pressable>
          </View>
          {previewProfile && (
            <View style={styles.profilePreview}>
              <View style={styles.previewDivider} />
              <Text style={styles.previewLabel}>Publiek Profiel Voorbeeld</Text>
              <View style={styles.previewMeters}>
                {(["honor", "reflectie", "vitality", "decay"] as const).map((m) => (
                  <View key={m} style={styles.previewMeter}>
                    <Text style={styles.previewMeterLabel}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                    <Text style={[styles.previewMeterVal, { color: m === "honor" ? COLORS.honor : m === "reflectie" ? COLORS.shame : m === "vitality" ? COLORS.vitality : COLORS.decay }]}>{meters[m]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </GlassPanel>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: "Totaal XP", value: totalXP + " XP", color: COLORS.xpGold, icon: "star" },
            { label: "Vrienden", value: String(friends.length), color: COLORS.emerald, icon: "people-outline" },
            { label: "Log Items", value: String(xpLog.length), color: COLORS.silver, icon: "list-outline" },
            { label: "Stemmen", value: "3", color: COLORS.silver, icon: "stats-chart-outline" },
          ].map((stat, i) => (
            <GlassPanel key={i} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassPanel>
          ))}
        </View>

        {/* Charts */}
        <Text style={styles.sectionTitle}>Honor Trend</Text>
        <GlassPanel style={styles.chartCard}>
          <BarChart data={HISTORY.map((h) => ({ week: h.week, value: h.honor }))} color={COLORS.honor} />
        </GlassPanel>

        <Text style={styles.sectionTitle}>Vitality Trend</Text>
        <GlassPanel style={styles.chartCard}>
          <BarChart data={HISTORY.map((h) => ({ week: h.week, value: h.vitality }))} color={COLORS.vitality} />
        </GlassPanel>

        {/* Full XP log */}
        <Text style={styles.sectionTitle}>Volledig XP Logboek</Text>
        <GlassPanel style={styles.fullLog}>
          {xpLog.map((entry, i) => (
            <View key={entry.id} style={[styles.logEntry, i > 0 && styles.logBorder]}>
              <View style={styles.logLeft}>
                <View style={[styles.logDot, { backgroundColor: entry.category === "honor" ? COLORS.honor : entry.category === "reflectie" ? COLORS.shame : entry.category === "vitality" ? COLORS.vitality : entry.category === "decay" ? COLORS.decay : COLORS.silver }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logAction} numberOfLines={1}>{entry.action}</Text>
                  <Text style={styles.logTime}>{new Date(entry.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
                </View>
              </View>
              <Text style={[styles.logXP, { color: entry.xp > 0 ? COLORS.emerald : COLORS.decay }]}>
                {entry.xp > 0 ? "+" : ""}{entry.xp}
              </Text>
            </View>
          ))}
        </GlassPanel>

        {/* Trust Gravity info */}
        <GlassPanel variant="silver" style={styles.gravityNote}>
          <Ionicons name="trending-up-outline" size={18} color={COLORS.silver} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gravityTitle}>Trust-Gravity</Text>
            <Text style={styles.gravityText}>
              Stemmen van gebruikers met hogere Honor scores wegen zwaarder. Jouw Honor ({meters.honor}) geeft je stemmen een gewicht van {(meters.honor / 100).toFixed(2)}x.
            </Text>
          </View>
        </GlassPanel>

        {/* Mijn Account menu */}
        <Text style={styles.sectionTitle}>Mijn Account</Text>
        <GlassPanel style={styles.menuCard}>
          {[
            { label: "Instellingen", sub: "Notificaties & voorkeuren", icon: "settings-outline", route: "/settings" },
            { label: "Help & Support", sub: "FAQ en contactopties", icon: "help-circle-outline", route: "/help" },
            { label: "Over Lumia", sub: "Versie & missie", icon: "information-circle-outline", route: "/about" },
            { label: "Privacybeleid", sub: "Hoe wij jouw data beschermen", icon: "shield-outline", route: "/privacy" },
            { label: "Algemene Voorwaarden", sub: "Gebruiksregels & Plus", icon: "document-text-outline", route: "/terms" },
          ].map((item, i) => (
            <Pressable key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(item.route as any); }}
              style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuRowBorder, pressed && { opacity: 0.7 }]}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={18} color="#A855F7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </GlassPanel>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  pageTitle: { fontSize: 32, color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", letterSpacing: -0.5 },
  pageSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  adminBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(192,200,216,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.silverBorder },
  profileCard: { padding: 16, marginBottom: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,224,122,0.1)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.emeraldBorder },
  profileAvatarEmoji: { fontSize: 26 },
  profileName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  profileLevel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, marginTop: 2 },
  previewBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: COLORS.silverBorder, backgroundColor: "rgba(192,200,216,0.05)" },
  previewBtnActive: { borderColor: COLORS.emeraldBorder, backgroundColor: "rgba(0,224,122,0.08)" },
  previewText: { color: COLORS.silver, fontFamily: "Outfit_500Medium", fontSize: 13 },
  profilePreview: { marginTop: 12 },
  previewDivider: { height: 1, backgroundColor: COLORS.silverBorder, marginBottom: 12 },
  previewLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginBottom: 10 },
  previewMeters: { flexDirection: "row", justifyContent: "space-between" },
  previewMeter: { alignItems: "center", gap: 4 },
  previewMeterLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: "Outfit_400Regular" },
  previewMeterVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { padding: 14, flex: 1, minWidth: "45%", gap: 6, alignItems: "flex-start" },
  statValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  statLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12 },
  sectionTitle: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  chartCard: { padding: 16, marginBottom: 20 },
  fullLog: { overflow: "hidden", marginBottom: 16 },
  logEntry: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  logBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
  logTime: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10, marginTop: 1 },
  logXP: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  gravityNote: { padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  gravityTitle: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13, marginBottom: 4 },
  gravityText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, lineHeight: 18 },
  menuCard: { overflow: "hidden", marginBottom: 20 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(168,85,247,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(168,85,247,0.25)" },
  menuLabel: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  menuSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
});
```

---

## 6. app/onboarding.tsx

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { useLumia } from "@/context/LumiaContext";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    icon: "shield-checkmark", iconColor: COLORS.honor,
    title: "Welkom bij Lumia", subtitle: "Het Elite Trust Platform",
    body: "Lumia meet jouw betrouwbaarheid via 4 Trust Meters: Honor, Reflectie, Vitality en Decay. Samen vormen ze jouw Trust Score.",
    accent: COLORS.honor,
  },
  {
    icon: "stats-chart", iconColor: COLORS.emerald,
    title: "Trust-Gravity", subtitle: "Jouw stem heeft gewicht",
    body: "Hoe hoger jouw Honor score, hoe meer gewicht jouw stem heeft bij stellingen. Stemmen is geen gelijkspel — eerlijkheid wordt beloond.",
    accent: COLORS.emerald,
  },
  {
    icon: "star", iconColor: COLORS.xpGold,
    title: "XP & Gifting", subtitle: "Erken andere vertrouwde leden",
    body: "Verdien XP door eerlijk te handelen, stellingen te plaatsen en je tuin te verzorgen. Stuur XP gifts aan vrienden die je vertrouwt.",
    accent: COLORS.xpGold,
  },
  {
    icon: "leaf", iconColor: COLORS.vitality,
    title: "Jouw Levende Tuin", subtitle: "Een spiegel van jouw vertrouwen",
    body: "Je tuin groeit mee met jouw Vitality score. Water geven, voeden, snoeien en aaien — elke actie versterkt jouw Trust Meters.",
    accent: COLORS.vitality,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useLumia();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const topPadding = Platform.OS === "web" ? 80 : insets.top + 20;
  const bottomPadding = Platform.OS === "web" ? 40 : insets.bottom + 20;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const animate = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
    cb();
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) { completeOnboarding(); router.replace("/(tabs)"); return; }
    animate(() => setStep((s) => s + 1));
  };

  const goBack = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animate(() => setStep((s) => s - 1));
  };

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step ? [styles.dotActive, { backgroundColor: current.accent }] : styles.dotInactive]} />
          ))}
        </View>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={[styles.iconCircle, { borderColor: current.accent + "40", backgroundColor: current.accent + "15" }]}>
            <Ionicons name={current.icon as any} size={52} color={current.accent} />
          </View>
          <Text style={[styles.subtitle, { color: current.accent }]}>{current.subtitle}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
        </Animated.View>
        <View style={styles.navRow}>
          {step > 0 ? (
            <Pressable onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.silver} />
            </Pressable>
          ) : <View style={{ width: 44 }} />}
          <Pressable onPress={goNext} style={[styles.nextBtn, { backgroundColor: current.accent + "20", borderColor: current.accent + "50" }]}>
            <Text style={[styles.nextText, { color: current.accent }]}>{isLast ? "Begin met Lumia" : "Volgende"}</Text>
            <Ionicons name={isLast ? "checkmark-circle" : "arrow-forward"} size={18} color={current.accent} />
          </Pressable>
        </View>
        {!isLast && (
          <Pressable onPress={() => { completeOnboarding(); router.replace("/(tabs)"); }} style={styles.skipBtn}>
            <Text style={styles.skipText}>Overslaan</Text>
          </Pressable>
        )}
      </View>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 40 },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 24 },
  dotInactive: { width: 8, backgroundColor: "rgba(255,255,255,0.15)" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  subtitle: { fontFamily: "Outfit_600SemiBold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 30, color: COLORS.textPrimary, textAlign: "center", letterSpacing: -0.5 },
  body: { fontFamily: "Outfit_400Regular", fontSize: 15, color: COLORS.textSecondary, textAlign: "center", lineHeight: 24, maxWidth: 320 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 32, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(192,200,216,0.08)", borderWidth: 1, borderColor: COLORS.silverBorder, alignItems: "center", justifyContent: "center" },
  nextBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  nextText: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  skipBtn: { alignItems: "center", marginTop: 16 },
  skipText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
});
```

---

## 7. context/LumiaContext.tsx

> De volledige context provider — zie het bestand direct in de codebase voor de complete versie (`artifacts/lumia/context/LumiaContext.tsx`).

**Korte samenvatting van de structuur:**

```typescript
// Types
export type Meter = { honor: number; reflectie: number; vitality: number; decay: number; };
export type XPLogEntry = { id: string; action: string; xp: number; timestamp: number; category: "honor"|"reflectie"|"vitality"|"decay"|"social"; };
export type Statement = { id: string; text: string; options: [string,string,string]; votes: [number,number,number]; author: string; authorId: string; timestamp: number; anonymous: boolean; myVote?: number; };
export type Message = { id: string; senderId: string; senderName: string; text: string; xpGift?: number; timestamp: number; };
export type Friend = { id: string; name: string; avatar: string; honor: number; vitality: number; isOnline: boolean; xp: number; };
export type Notification = { id: string; type: "xp_gift"|"friend_request"|"vote"|"honor_change"|"message"|"system"; title: string; body: string; timestamp: number; read: boolean; };

// Context functies
getTrustGravityWeight(userId?) // → honor / 100
doGardenAction("water"|"feed"|"prune"|"pet") // XP + vitality
voteOnStatement(id, optionIndex) // Trust-Gravity stem
addStatement(statement) // Nieuwe stelling
sendMessage(chatId, text, xpGift?) // Chat + XP gift
markNotificationRead(id) // Melding gelezen
markAllNotificationsRead() // Alles gelezen
completeOnboarding() // Onboarding afronden
```

---

## 8. components/DualGlowBackground.tsx

```tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props extends ViewProps {
  children: React.ReactNode;
  intensity?: "subtle" | "normal" | "strong";
}

export function DualGlowBackground({ children, intensity = "normal", style, ...props }: Props) {
  const opacities = {
    subtle: { top: 0.08, bottom: 0.06 },
    normal: { top: 0.14, bottom: 0.10 },
    strong: { top: 0.22, bottom: 0.18 },
  };
  const op = opacities[intensity];

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bg }]} />
      <LinearGradient
        colors={[`rgba(200,215,255,${op.top})`, `rgba(200,215,255,0.04)`, "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", `rgba(0,200,100,0.04)`, `rgba(0,200,100,${op.bottom})`]}
        style={styles.bottomGlow}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 300, zIndex: 0 },
  bottomGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 300, zIndex: 0 },
});
```

---

## 9. components/GlassPanel.tsx

```tsx
import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "emerald" | "silver" | "honor" | "shame" | "vitality" | "decay";
  style?: ViewStyle;
}

const variantStyles: Record<string, { bg: string; border: string; glow: string }> = {
  default:  { bg: "rgba(255,255,255,0.04)",  border: COLORS.silverBorder,          glow: "transparent" },
  emerald:  { bg: "rgba(0,224,122,0.06)",    border: COLORS.emeraldBorder,         glow: "rgba(0,224,122,0.08)" },
  silver:   { bg: "rgba(192,200,216,0.06)",  border: COLORS.silverBorder,          glow: "rgba(192,200,216,0.08)" },
  honor:    { bg: "rgba(255,215,0,0.05)",    border: "rgba(255,215,0,0.25)",       glow: COLORS.honorGlow },
  shame:    { bg: "rgba(168,85,247,0.05)",   border: "rgba(168,85,247,0.25)",      glow: COLORS.shameGlow },
  vitality: { bg: "rgba(0,224,122,0.05)",    border: "rgba(0,224,122,0.25)",       glow: COLORS.vitalityGlow },
  decay:    { bg: "rgba(239,68,68,0.05)",    border: "rgba(239,68,68,0.25)",       glow: COLORS.decayGlow },
};

export function GlassPanel({ children, variant = "default", style, ...props }: Props) {
  const vs = variantStyles[variant];
  return (
    <View style={[styles.panel, { backgroundColor: vs.bg, borderColor: vs.border, shadowColor: vs.glow }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
});
```

---

## 10. components/MeterCard.tsx

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "@/constants/colors";
import { GlassPanel } from "./GlassPanel";

export type MeterType = "honor" | "reflectie" | "vitality" | "decay";

const METER_CONFIG: Record<MeterType, { label: string; subtitle: string; color: string; glow: string; icon: string; }> = {
  honor:    { label: "Honor",    subtitle: "Integriteit", color: COLORS.honor,    glow: COLORS.honorGlow,    icon: "shield" },
  reflectie:{ label: "Reflectie",subtitle: "Bewustzijn",  color: COLORS.shame,    glow: COLORS.shameGlow,    icon: "refresh-circle" },
  vitality: { label: "Vitality", subtitle: "Energie",     color: COLORS.vitality, glow: COLORS.vitalityGlow, icon: "heart" },
  decay:    { label: "Decay",    subtitle: "Risico",      color: COLORS.decay,    glow: COLORS.decayGlow,    icon: "flame" },
};

const SIZE = 52;
const STROKE = 5;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function MeterCard({ type, value }: { type: MeterType; value: number }) {
  const config = METER_CONFIG[type];
  const pct = Math.min(100, Math.max(0, value));
  const strokeDash = (pct / 100) * CIRC;
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animVal, { toValue: pct, useNativeDriver: false, tension: 50, friction: 8 }).start();
  }, [pct]);

  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/transparency/[meter]", params: { meter: type } }); }}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
    >
      <GlassPanel variant={type === "reflectie" ? "shame" : type} style={styles.card}>
        <View style={styles.header}>
          <Ionicons name={config.icon as any} size={14} color={config.color} />
          <Text style={[styles.label, { fontFamily: "SpaceGrotesk_600SemiBold" }]}>{config.label}</Text>
        </View>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: config.color, fontFamily: "SpaceGrotesk_700Bold" }]}>{value}</Text>
          <Svg width={SIZE} height={SIZE} style={{ marginLeft: 8 }}>
            <Circle cx={SIZE/2} cy={SIZE/2} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
            <Circle cx={SIZE/2} cy={SIZE/2} r={R} stroke={config.color} strokeWidth={STROKE} fill="none"
              strokeDasharray={`${strokeDash} ${CIRC}`} strokeLinecap="round"
              transform={`rotate(-90, ${SIZE/2}, ${SIZE/2})`} />
          </Svg>
        </View>
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { backgroundColor: config.color }]} />
          <Text style={[styles.liveText, { color: config.color }]}>Live</Text>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "48%", marginBottom: 12 },
  card: { padding: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { color: COLORS.textPrimary, fontSize: 13 },
  subtitle: { color: COLORS.textMuted, fontSize: 11, fontFamily: "Outfit_400Regular", marginTop: 2, marginBottom: 8 },
  valueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  value: { fontSize: 36, lineHeight: 40 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontFamily: "Outfit_400Regular" },
});
```

---

## 11. components/LivingGarden.tsx

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { COLORS } from "@/constants/colors";
import { useLumia } from "@/context/LumiaContext";

const ACTION_BUTTONS = [
  { key: "water" as const, icon: "water-outline", label: "Water", color: "#4FC3F7" },
  { key: "feed" as const, icon: "leaf-outline", label: "Feed", color: COLORS.emerald },
  { key: "prune" as const, icon: "cut-outline", label: "Prune", color: "#FFD700" },
  { key: "pet" as const, icon: "heart-outline", label: "Pet", color: "#F472B6" },
];

function GardenTree({ vitality }: { vitality: number }) {
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const g = Math.min(255, Math.floor((vitality / 100) * 200 + 55));
  const treeColor = `rgb(0,${g},80)`;

  return (
    <View style={styles.treeContainer}>
      <Animated.View style={[styles.glowCircle, { opacity: glow, backgroundColor: "rgba(0,200,80,0.12)" }]} />
      <Svg width={160} height={200} viewBox="0 0 160 200">
        <Path d="M75 180 Q60 190 45 195" stroke="rgba(0,180,70,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M85 180 Q100 190 115 195" stroke="rgba(0,180,70,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M70 180 Q72 150 75 120" stroke={treeColor} strokeWidth="8" fill="none" strokeLinecap="round" />
        <Path d="M90 180 Q88 150 85 120" stroke={treeColor} strokeWidth="8" fill="none" strokeLinecap="round" />
        <Ellipse cx="80" cy="110" rx="50" ry="40" fill={treeColor} opacity="0.9" />
        <Ellipse cx="55" cy="100" rx="30" ry="25" fill={treeColor} opacity="0.85" />
        <Ellipse cx="105" cy="100" rx="30" ry="25" fill={treeColor} opacity="0.85" />
        <Ellipse cx="80" cy="85" rx="40" ry="32" fill={`rgb(0,${Math.min(255, g+30)},90)`} opacity="0.9" />
        <Ellipse cx="80" cy="70" rx="28" ry="22" fill={`rgb(0,${Math.min(255, g+50)},100)`} opacity="0.95" />
        <Circle cx="80" cy="60" r="15" fill="rgba(0,255,120,0.3)" />
        <Circle cx="80" cy="58" r="8" fill="rgba(100,255,170,0.5)" />
        <Circle cx="80" cy="55" r="4" fill="rgba(200,255,220,0.9)" />
      </Svg>
    </View>
  );
}

export function LivingGarden() {
  const { gardenVitality, doGardenAction } = useLumia();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const handleAction = (action: "water" | "feed" | "prune" | "pet") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    doGardenAction(action);
    setLastAction(action);
    feedbackAnim.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLastAction(null));
  };

  return (
    <View style={styles.container}>
      <GardenTree vitality={gardenVitality} />
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Vitality</Text>
          <Text style={styles.progressValue}>{gardenVitality}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient colors={[COLORS.emerald, "#00FF99"]} start={{ x:0, y:0 }} end={{ x:1, y:0 }}
            style={[styles.progressFill, { width: `${gardenVitality}%` }]} />
        </View>
      </View>
      {lastAction && (
        <Animated.View style={[styles.feedbackToast, { opacity: feedbackAnim, transform: [{ translateY: feedbackAnim.interpolate({ inputRange:[0,1], outputRange:[10,0] }) }] }]}>
          <Text style={styles.feedbackText}>
            {lastAction === "water" ? "💧 +3 XP" : lastAction === "feed" ? "🌱 +5 XP" : lastAction === "prune" ? "✂ +4 XP" : "💖 +2 XP"}
          </Text>
        </Animated.View>
      )}
      <View style={styles.actionsRow}>
        {ACTION_BUTTONS.map((btn) => (
          <Pressable key={btn.key} onPress={() => handleAction(btn.key)}
            style={({ pressed }) => [styles.actionBtn, { borderColor: btn.color + "40", backgroundColor: btn.color + "10" }, pressed && { transform: [{ scale: 0.93 }], opacity: 0.8 }]}>
            <Ionicons name={btn.icon as any} size={22} color={btn.color} />
            <Text style={[styles.actionLabel, { color: btn.color }]}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 8 },
  treeContainer: { alignItems: "center", justifyContent: "center", marginVertical: 4 },
  glowCircle: { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  progressSection: { width: "100%", paddingHorizontal: 4, marginBottom: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: "Outfit_400Regular" },
  progressValue: { color: COLORS.emerald, fontSize: 12, fontFamily: "SpaceGrotesk_600SemiBold" },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  feedbackToast: { marginBottom: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: "rgba(0,224,122,0.15)", borderRadius: 20, borderWidth: 1, borderColor: COLORS.emeraldBorder },
  feedbackText: { color: COLORS.emerald, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  actionsRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  actionBtn: { alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, minWidth: 64 },
  actionLabel: { fontSize: 11, fontFamily: "Outfit_500Medium" },
});
```

---

## 12. API: routes/lumia.ts

```typescript
import { Router } from "express";
import { dbSelect, dbInsert, dbUpdate, getClient, TABLE_PREFIX, PROJECT_ID } from "../lib/insforge";
import { logger } from "../lib/logger";

const router = Router();

// ─── Setup Status ──────────────────────────────────────────────────────────
router.get("/lumia/setup/status", async (_req, res) => {
  const tables = ["meters","xp_log","statements","statement_votes","friends","friend_requests","messages","notifications"];
  const status: Record<string, boolean> = {};
  for (const t of tables) {
    try { await dbSelect(t, {}); status[t] = true; } catch { status[t] = false; }
  }
  const allReady = Object.values(status).every(Boolean);
  res.json({ ready: allReady, tables: status });
});

// ─── Meters ────────────────────────────────────────────────────────────────
router.get("/lumia/meters/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("meters", { user_id: req.params.userId });
    if (rows.length === 0) return res.json({ honor: 76, reflectie: 13, vitality: 91, decay: 3 });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/meters/:userId/upsert", async (req, res) => {
  try {
    const client = getClient();
    const { data, error } = await client.database.from(`${TABLE_PREFIX}meters`)
      .upsert([{ ...req.body, user_id: req.params.userId, project_id: PROJECT_ID }]);
    if (error) throw error;
    res.json(data?.[0] ?? req.body);
  } catch (err) {
    try { const rows = await dbInsert("meters", { ...req.body, user_id: req.params.userId }); res.json(rows[0] ?? {}); }
    catch (e2) { res.status(500).json({ error: String(e2) }); }
  }
});

// ─── Statements ────────────────────────────────────────────────────────────
router.get("/lumia/statements", async (_req, res) => {
  try { res.json(await dbSelect("statements", {}, { order: "created_at.desc" })); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/statements", async (req, res) => {
  try {
    const body = req.body;
    const rows = await dbInsert("statements", { ...body, votes_0: body.votes_0??0, votes_1: body.votes_1??0, votes_2: body.votes_2??0 });
    res.status(201).json(rows[0] ?? req.body);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/statements/:id/vote", async (req, res) => {
  try { await dbInsert("statement_votes", { statement_id: req.params.id, ...req.body }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

// ─── XP Log ───────────────────────────────────────────────────────────────
router.get("/lumia/xp-log/:userId", async (req, res) => {
  try { res.json(await dbSelect("xp_log", { user_id: req.params.userId }, { order: "created_at.desc", limit: 50 })); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/xp-log/:userId", async (req, res) => {
  try { const rows = await dbInsert("xp_log", { ...req.body, user_id: req.params.userId }); res.status(201).json(rows[0] ?? {}); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

// ─── Notifications ────────────────────────────────────────────────────────
router.get("/lumia/notifications/:userId", async (req, res) => {
  try { res.json(await dbSelect("notifications", { user_id: req.params.userId }, { order: "created_at.desc" })); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/notifications/:userId", async (req, res) => {
  try { const rows = await dbInsert("notifications", { ...req.body, user_id: req.params.userId, read: false }); res.status(201).json(rows[0] ?? {}); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.patch("/lumia/notifications/:userId/:notifId/read", async (req, res) => {
  try { await dbUpdate("notifications", req.params.notifId, { read: true }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

// ─── Friends ──────────────────────────────────────────────────────────────
router.get("/lumia/friends/:userId", async (req, res) => {
  try { res.json(await dbSelect("friends", { user_id: req.params.userId })); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/friends/:userId", async (req, res) => {
  try { const rows = await dbInsert("friends", { ...req.body, user_id: req.params.userId }); res.status(201).json(rows[0] ?? {}); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

// ─── Messages ─────────────────────────────────────────────────────────────
router.get("/lumia/messages/:chatId", async (req, res) => {
  try { res.json(await dbSelect("messages", { chat_id: req.params.chatId }, { order: "created_at.asc" })); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post("/lumia/messages", async (req, res) => {
  try { const rows = await dbInsert("messages", req.body); res.status(201).json(rows[0] ?? {}); }
  catch (err) { res.status(500).json({ error: String(err) }); }
});

export default router;
```

---

## 13. API: lib/insforge.ts

```typescript
import { createClient } from "@insforge/sdk";
import { logger } from "./logger";

export const PROJECT_ID = "LUMIA_2026";
export const TABLE_PREFIX = "lumia_";

export function getClient() {
  const rawUrl = process.env.INSFORGE_URL;
  const anonKey = process.env.INSFORGE_API_KEY;
  if (!rawUrl || !anonKey) throw new Error("INSFORGE_URL and INSFORGE_API_KEY must be set");
  return createClient({ baseUrl: rawUrl.replace(/\/+$/, ""), anonKey, isServerMode: true });
}

export type Row = Record<string, unknown>;

export async function dbSelect(
  tableName: string,
  filters: Record<string, unknown> = {},
  options: { order?: string; limit?: number } = {}
): Promise<Row[]> {
  const client = getClient();
  let query = client.database.from(`${TABLE_PREFIX}${tableName}`).select("*").eq("project_id", PROJECT_ID);
  for (const [col, val] of Object.entries(filters)) query = query.eq(col, val as string);
  const { data, error } = await (query as any);
  if (error) throw new Error(`Insforge SELECT ${tableName}: ${error.message}`);
  let rows: Row[] = (data as Row[]) ?? [];
  if (options.order) {
    const [col, dir] = options.order.split(".");
    rows = rows.sort((a, b) => dir === "desc" ? String(b[col]).localeCompare(String(a[col])) : String(a[col]).localeCompare(String(b[col])));
  }
  if (options.limit) rows = rows.slice(0, options.limit);
  return rows;
}

export async function dbInsert(tableName: string, row: Row): Promise<Row[]> {
  const client = getClient();
  const { data, error } = await client.database.from(`${TABLE_PREFIX}${tableName}`).insert([{ ...row, project_id: PROJECT_ID }]);
  if (error) throw new Error(`Insforge INSERT ${tableName}: ${error.message}`);
  return (data as Row[]) ?? [];
}

export async function dbUpdate(tableName: string, id: string, updates: Row): Promise<Row[]> {
  const client = getClient();
  const { data, error } = await client.database.from(`${TABLE_PREFIX}${tableName}`).update(updates).eq("id", id).eq("project_id", PROJECT_ID);
  if (error) throw new Error(`Insforge UPDATE ${tableName}: ${error.message}`);
  return (data as Row[]) ?? [];
}
```

---

## 14. API: index.ts

```typescript
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

app.listen(port, (err) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");
});
```

---

*Lumia 2026 — Broncode documentatie | Versie 1.0.0 | 23 juni 2026*
