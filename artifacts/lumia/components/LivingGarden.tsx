import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { COLORS } from "@/constants/colors";
import { useLumia } from "@/context/LumiaContext";

const ACTION_BUTTONS = [
  { key: "water" as const, icon: "water-outline", label: "Water", color: "#4FC3F7", iconSet: "ionicons" },
  { key: "feed" as const, icon: "leaf-outline", label: "Feed", color: COLORS.emerald, iconSet: "ionicons" },
  { key: "prune" as const, icon: "cut-outline", label: "Prune", color: "#FFD700", iconSet: "ionicons" },
  { key: "pet" as const, icon: "heart-outline", label: "Pet", color: "#F472B6", iconSet: "ionicons" },
];

function GardenTree({ vitality, level }: { vitality: number; level: number }) {
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const greenIntensity = Math.min(255, Math.floor((vitality / 100) * 200 + 55));
  const treeColor = `rgb(0,${greenIntensity},80)`;

  return (
    <View style={styles.treeContainer}>
      {/* Glow effect behind tree */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glow,
            backgroundColor: `rgba(0,200,80,0.12)`,
          },
        ]}
      />
      <Svg width={160} height={200} viewBox="0 0 160 200">
        {/* Roots */}
        <Path d="M75 180 Q60 190 45 195" stroke="rgba(0,180,70,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M85 180 Q100 190 115 195" stroke="rgba(0,180,70,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M80 185 Q80 200 70 205" stroke="rgba(0,180,70,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Trunk */}
        <Path d="M70 180 Q72 150 75 120" stroke={treeColor} strokeWidth="8" fill="none" strokeLinecap="round" />
        <Path d="M90 180 Q88 150 85 120" stroke={treeColor} strokeWidth="8" fill="none" strokeLinecap="round" />

        {/* Main canopy layers */}
        <Ellipse cx="80" cy="110" rx="50" ry="40" fill={treeColor} opacity="0.9" />
        <Ellipse cx="55" cy="100" rx="30" ry="25" fill={treeColor} opacity="0.85" />
        <Ellipse cx="105" cy="100" rx="30" ry="25" fill={treeColor} opacity="0.85" />
        <Ellipse cx="80" cy="85" rx="40" ry="32" fill={`rgb(0,${Math.min(255, greenIntensity + 30)},90)`} opacity="0.9" />
        <Ellipse cx="80" cy="70" rx="28" ry="22" fill={`rgb(0,${Math.min(255, greenIntensity + 50)},100)`} opacity="0.95" />

        {/* Top glow */}
        <Circle cx="80" cy="60" r="15" fill={`rgba(0,255,120,0.3)`} />
        <Circle cx="80" cy="58" r="8" fill={`rgba(100,255,170,0.5)`} />
        <Circle cx="80" cy="55" r="4" fill={`rgba(200,255,220,0.9)`} />

        {/* Crystal base hints */}
        <Path d="M68 175 L72 160 L76 175" fill="rgba(150,200,255,0.3)" />
        <Path d="M84 175 L88 162 L92 175" fill="rgba(150,200,255,0.3)" />

        {/* Sparkle dots */}
        <Circle cx="45" cy="95" r="2" fill="rgba(200,255,220,0.8)" />
        <Circle cx="115" cy="88" r="1.5" fill="rgba(200,255,220,0.8)" />
        <Circle cx="60" cy="72" r="1.5" fill="rgba(200,255,220,0.6)" />
        <Circle cx="100" cy="78" r="2" fill="rgba(200,255,220,0.6)" />
        <Circle cx="80" cy="45" r="1.5" fill="rgba(255,255,255,0.9)" />
      </Svg>
    </View>
  );
}

export function LivingGarden() {
  const { gardenVitality, gardenLevel, doGardenAction } = useLumia();
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
      {/* Garden tree visualization */}
      <GardenTree vitality={gardenVitality} level={gardenLevel} />

      {/* Vitality progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Vitality</Text>
          <Text style={styles.progressValue}>{gardenVitality}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[COLORS.emerald, "#00FF99"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${gardenVitality}%` }]}
          />
        </View>
      </View>

      {/* Feedback toast */}
      {lastAction && (
        <Animated.View
          style={[
            styles.feedbackToast,
            {
              opacity: feedbackAnim,
              transform: [{ translateY: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <Text style={styles.feedbackText}>
            {lastAction === "water" ? "💧 +3 XP" :
             lastAction === "feed" ? "🌱 +5 XP" :
             lastAction === "prune" ? "✂ +4 XP" : "💖 +2 XP"}
          </Text>
        </Animated.View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {ACTION_BUTTONS.map((btn) => (
          <Pressable
            key={btn.key}
            onPress={() => handleAction(btn.key)}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                borderColor: btn.color + "40",
                backgroundColor: btn.color + "10",
              },
              pressed && { transform: [{ scale: 0.93 }], opacity: 0.8 },
            ]}
          >
            <Ionicons name={btn.icon as any} size={22} color={btn.color} />
            <Text style={[styles.actionLabel, { color: btn.color }]}>{btn.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  treeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  glowCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  progressSection: {
    width: "100%",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  progressValue: {
    color: COLORS.emerald,
    fontSize: 12,
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  feedbackToast: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(0,224,122,0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  feedbackText: {
    color: COLORS.emerald,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 64,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
  },
});
