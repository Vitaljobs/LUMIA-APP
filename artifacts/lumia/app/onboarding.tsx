import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { useLumia } from "@/context/LumiaContext";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    icon: "shield-checkmark",
    iconColor: COLORS.honor,
    title: "Welkom bij Lumia",
    subtitle: "Het Elite Trust Platform",
    body: "Lumia meet jouw betrouwbaarheid via 4 Trust Meters: Honor, Reflectie, Vitality en Decay. Samen vormen ze jouw Trust Score.",
    accent: COLORS.honor,
  },
  {
    icon: "stats-chart",
    iconColor: COLORS.emerald,
    title: "Trust-Gravity",
    subtitle: "Jouw stem heeft gewicht",
    body: "Hoe hoger jouw Honor score, hoe meer gewicht jouw stem heeft bij stellingen. Stemmen is geen gelijkspel — eerlijkheid wordt beloond.",
    accent: COLORS.emerald,
  },
  {
    icon: "star",
    iconColor: COLORS.xpGold,
    title: "XP & Gifting",
    subtitle: "Erken andere vertrouwde leden",
    body: "Verdien XP door eerlijk te handelen, stellingen te plaatsen en je tuin te verzorgen. Stuur XP gifts aan vrienden die je vertrouwt.",
    accent: COLORS.xpGold,
  },
  {
    icon: "leaf",
    iconColor: COLORS.vitality,
    title: "Jouw Levende Tuin",
    subtitle: "Een spiegel van jouw vertrouwen",
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

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      completeOnboarding();
      router.replace("/(tabs)");
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
    setStep((s) => s - 1);
  };

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        {/* Step dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step
                  ? [styles.dotActive, { backgroundColor: current.accent }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={[styles.iconCircle, { borderColor: current.accent + "40", backgroundColor: current.accent + "15" }]}>
            <Ionicons name={current.icon as any} size={52} color={current.accent} />
          </View>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: current.accent }]}>{current.subtitle}</Text>

          {/* Title */}
          <Text style={styles.title}>{current.title}</Text>

          {/* Body */}
          <Text style={styles.body}>{current.body}</Text>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 0 ? (
            <Pressable onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={COLORS.silver} />
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}

          <Pressable
            onPress={goNext}
            style={[styles.nextBtn, { backgroundColor: current.accent + "20", borderColor: current.accent + "50" }]}
          >
            <Text style={[styles.nextText, { color: current.accent }]}>
              {isLast ? "Begin met Lumia" : "Volgende"}
            </Text>
            <Ionicons
              name={isLast ? "checkmark-circle" : "arrow-forward"}
              size={18}
              color={current.accent}
            />
          </Pressable>
        </View>

        {/* Skip */}
        {!isLast && (
          <Pressable
            onPress={() => { completeOnboarding(); router.replace("/(tabs)"); }}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Overslaan</Text>
          </Pressable>
        )}
      </View>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 24 },
  dotInactive: { width: 8, backgroundColor: "rgba(255,255,255,0.15)" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 30,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(192,200,216,0.08)",
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  nextText: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  skipBtn: { alignItems: "center", marginTop: 16 },
  skipText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
});
