import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";

const METER_META: Record<string, {
  label: string;
  subtitle: string;
  description: string;
  color: string;
  glow: string;
  breakdown: { label: string; value: number; note: string }[];
}> = {
  honor: {
    label: "Honor",
    subtitle: "Integriteit Score",
    description: "Honor meet jouw betrouwbaarheid en integriteit binnen het platform. Hoge Honor geeft je meer gewicht bij stemmen (Trust-Gravity) en opent premium functies.",
    color: COLORS.honor,
    glow: COLORS.honorGlow,
    breakdown: [
      { label: "Eerlijke reacties", value: 32, note: "+32 XP" },
      { label: "Stellingen geplaatst", value: 20, note: "+20 XP" },
      { label: "Vrienden geaccepteerd", value: 24, note: "+24 XP" },
    ],
  },
  shame: {
    label: "Shame",
    subtitle: "Waarschuwing Score",
    description: "Shame registreert negatieve acties zoals het intrekken van reacties of het breken van beloftes. Hoge Shame vermindert je stemgewicht.",
    color: COLORS.shame,
    glow: COLORS.shameGlow,
    breakdown: [
      { label: "Reacties ingetrokken", value: 8, note: "-8 XP" },
      { label: "Beloftes verbroken", value: 5, note: "-5 XP" },
    ],
  },
  vitality: {
    label: "Vitality",
    subtitle: "Energie Score",
    description: "Vitality toont hoe actief en gezond jouw Lumia-profiel is. Verzorg je tuin en doe dagelijkse acties om Vitality hoog te houden.",
    color: COLORS.vitality,
    glow: COLORS.vitalityGlow,
    breakdown: [
      { label: "Tuin acties", value: 45, note: "+45 XP" },
      { label: "Dagelijkse login", value: 30, note: "+30 XP" },
      { label: "Berichten verstuurd", value: 16, note: "+16 XP" },
    ],
  },
  decay: {
    label: "Decay",
    subtitle: "Risico Score",
    description: "Decay meet inactiviteit en negatieve patronen. Laag Decay betekent dat je platform-gezondheid goed is. Actief blijven houdt Decay laag.",
    color: COLORS.decay,
    glow: COLORS.decayGlow,
    breakdown: [
      { label: "Inactieve dagen", value: 3, note: "Risico factor" },
    ],
  },
};

const SIZE = 120;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function TransparencySheet() {
  const insets = useSafeAreaInsets();
  const { meter } = useLocalSearchParams<{ meter: string }>();
  const { meters, xpLog } = useLumia();

  const meta = METER_META[meter ?? "honor"] ?? METER_META.honor;
  const value = meters[meter as keyof typeof meters] ?? 0;
  const pct = Math.min(100, Math.max(0, value));
  const strokeDash = (pct / 100) * CIRC;

  const relatedLog = xpLog.filter((e) => e.category === meter).slice(0, 5);

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={22} color={COLORS.silver} />
          </Pressable>
          <Text style={styles.sheetLabel}>Transparency Sheet</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Big meter circle */}
        <View style={styles.circleSection}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={meta.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${strokeDash} ${CIRC}`}
              strokeLinecap="round"
              transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
            />
          </Svg>
          <View style={styles.circleCenter}>
            <Text style={[styles.circleVal, { color: meta.color, fontFamily: "SpaceGrotesk_700Bold" }]}>
              {value}
            </Text>
            <Text style={styles.circlePct}>{pct}%</Text>
          </View>
        </View>

        <Text style={[styles.meterName, { color: meta.color, fontFamily: "SpaceGrotesk_700Bold" }]}>
          {meta.label}
        </Text>
        <Text style={styles.meterSubtitle}>{meta.subtitle}</Text>

        {/* Description */}
        <GlassPanel variant={meter as any} style={styles.descCard}>
          <Feather name="info" size={16} color={meta.color} />
          <Text style={styles.descText}>{meta.description}</Text>
        </GlassPanel>

        {/* Score breakdown */}
        <Text style={styles.sectionTitle}>Score opbouw</Text>
        <GlassPanel style={styles.breakdownCard}>
          {meta.breakdown.map((item, i) => (
            <View key={i} style={[styles.breakdownRow, i > 0 && styles.breakdownBorder]}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <View style={styles.breakdownRight}>
                <Text style={styles.breakdownNote}>{item.note}</Text>
                <Text style={[styles.breakdownVal, { color: meta.color }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </GlassPanel>

        {/* Related XP log */}
        {relatedLog.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recente activiteit</Text>
            <GlassPanel style={styles.logCard}>
              {relatedLog.map((entry, i) => (
                <View key={entry.id} style={[styles.logRow, i > 0 && styles.logBorder]}>
                  <Text style={styles.logAction} numberOfLines={1}>{entry.action}</Text>
                  <Text style={[styles.logXP, { color: entry.xp > 0 ? COLORS.emerald : COLORS.decay }]}>
                    {entry.xp > 0 ? "+" : ""}{entry.xp}
                  </Text>
                </View>
              ))}
            </GlassPanel>
          </>
        )}

        {/* Trust-gravity impact */}
        <GlassPanel variant="silver" style={styles.gravityCard}>
          <Text style={styles.gravityTitle}>Trust-Gravity Impact</Text>
          <Text style={styles.gravityText}>
            {meter === "honor"
              ? `Met Honor ${value} hebben jouw stemmen een gewicht van ${(value / 100).toFixed(2)}x ten opzichte van andere gebruikers.`
              : meter === "shame"
              ? `Shame ${value} reduceert je stemgewicht met ${(value / 200).toFixed(2)}x.`
              : meter === "vitality"
              ? `Vitality ${value} geeft je +${Math.floor(value / 20)} dagelijkse XP bonus.`
              : `Decay ${value} triggert een ${value > 20 ? "verhoogde" : "normale"} monitoring status.`}
          </Text>
        </GlassPanel>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
  circleSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  circleCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  circleVal: { fontSize: 32, lineHeight: 36 },
  circlePct: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12 },
  meterName: { textAlign: "center", fontSize: 28, marginBottom: 4 },
  meterSubtitle: {
    color: COLORS.textMuted,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  descCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
  },
  descText: {
    color: COLORS.textSecondary,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  breakdownCard: { overflow: "hidden", marginBottom: 20 },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  breakdownBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  breakdownLabel: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
  breakdownRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  breakdownNote: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  breakdownVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  logCard: { overflow: "hidden", marginBottom: 20 },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  logBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  logAction: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, flex: 1 },
  logXP: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  gravityCard: { padding: 16, marginBottom: 20 },
  gravityTitle: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14, marginBottom: 6 },
  gravityText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 20 },
});
