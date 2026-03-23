import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "@/constants/colors";
import { GlassPanel } from "./GlassPanel";

type MeterType = "honor" | "shame" | "vitality" | "decay";

const METER_CONFIG: Record<MeterType, {
  label: string;
  subtitle: string;
  color: string;
  glow: string;
  icon: string;
  iconSet: "ionicons" | "feather";
}> = {
  honor: { label: "Honor", subtitle: "Integriteit", color: COLORS.honor, glow: COLORS.honorGlow, icon: "shield", iconSet: "ionicons" },
  shame: { label: "Shame", subtitle: "Waarschuwing", color: COLORS.shame, glow: COLORS.shameGlow, icon: "alert-circle", iconSet: "feather" },
  vitality: { label: "Vitality", subtitle: "Energie", color: COLORS.vitality, glow: COLORS.vitalityGlow, icon: "heart", iconSet: "ionicons" },
  decay: { label: "Decay", subtitle: "Risico", color: COLORS.decay, glow: COLORS.decayGlow, icon: "flame", iconSet: "ionicons" },
};

const SIZE = 52;
const STROKE = 5;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

interface Props {
  type: MeterType;
  value: number;
}

export function MeterCard({ type, value }: Props) {
  const config = METER_CONFIG[type];
  const pct = Math.min(100, Math.max(0, value));
  const strokeDash = (pct / 100) * CIRC;

  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animVal, {
      toValue: pct,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [pct]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/transparency/[meter]", params: { meter: type } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
    >
      <GlassPanel variant={type} style={styles.card}>
        {/* Header row */}
        <View style={styles.header}>
          {config.iconSet === "ionicons" ? (
            <Ionicons name={config.icon as any} size={14} color={config.color} />
          ) : (
            <Feather name={config.icon as any} size={14} color={config.color} />
          )}
          <Text style={[styles.label, { fontFamily: "SpaceGrotesk_600SemiBold" }]}>{config.label}</Text>
        </View>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {/* Value + Circle Row */}
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: config.color, fontFamily: "SpaceGrotesk_700Bold" }]}>
            {value}
          </Text>
          <Svg width={SIZE} height={SIZE} style={{ marginLeft: 8 }}>
            {/* Background track */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE}
              fill="none"
            />
            {/* Progress arc */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={config.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${strokeDash} ${CIRC}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
            />
          </Svg>
        </View>

        {/* Live indicator */}
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { backgroundColor: config.color }]} />
          <Text style={[styles.liveText, { color: config.color }]}>Live</Text>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 36,
    lineHeight: 40,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
  },
});
