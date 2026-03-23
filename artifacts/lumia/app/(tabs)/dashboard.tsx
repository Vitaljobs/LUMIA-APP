import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
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

function SparkLine({ data, color, width = 200, height = 50 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={4}
        fill={color}
      />
    </Svg>
  );
}

function BarChart({ data, color }: { data: { week: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 70 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: "100%",
              height: (d.value / max) * 60,
              backgroundColor: color + "30",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: color + "60",
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={[color + "80", color + "20"]}
              style={{ flex: 1 }}
            />
          </View>
          <Text style={{ color: COLORS.textMuted, fontSize: 9, fontFamily: "Outfit_400Regular" }}>
            {d.week}
          </Text>
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Dashboard</Text>
            <Text style={styles.pageSub}>Project: LUMIA_2026</Text>
          </View>
          {user.isAdmin && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/admin"); }}
              style={styles.adminBtn}
            >
              <Ionicons name="settings-outline" size={18} color={COLORS.silver} />
            </Pressable>
          )}
        </View>

        {/* Profile Preview toggle */}
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
            <Pressable
              onPress={() => { setPreviewProfile(!previewProfile); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.previewBtn, previewProfile && styles.previewBtnActive]}
            >
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
                    <Text style={[styles.previewMeterVal, {
                      color: m === "honor" ? COLORS.honor :
                             m === "reflectie" ? COLORS.shame :
                             m === "vitality" ? COLORS.vitality :
                             COLORS.decay
                    }]}>{meters[m]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </GlassPanel>

        {/* Stats summary */}
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

        {/* Honor over time */}
        <Text style={styles.sectionTitle}>Honor Trend</Text>
        <GlassPanel style={styles.chartCard}>
          <BarChart
            data={HISTORY.map((h) => ({ week: h.week, value: h.honor }))}
            color={COLORS.honor}
          />
        </GlassPanel>

        {/* Vitality over time */}
        <Text style={styles.sectionTitle}>Vitality Trend</Text>
        <GlassPanel style={styles.chartCard}>
          <BarChart
            data={HISTORY.map((h) => ({ week: h.week, value: h.vitality }))}
            color={COLORS.vitality}
          />
        </GlassPanel>

        {/* Full XP log */}
        <Text style={styles.sectionTitle}>Volledig XP Logboek</Text>
        <GlassPanel style={styles.fullLog}>
          {xpLog.map((entry, i) => (
            <View key={entry.id} style={[styles.logEntry, i > 0 && styles.logBorder]}>
              <View style={styles.logLeft}>
                <View
                  style={[
                    styles.logDot,
                    {
                      backgroundColor:
                        entry.category === "honor" ? COLORS.honor :
                        entry.category === "reflectie" ? COLORS.shame :
                        entry.category === "vitality" ? COLORS.vitality :
                        entry.category === "decay" ? COLORS.decay :
                        COLORS.silver,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logAction} numberOfLines={1}>{entry.action}</Text>
                  <Text style={styles.logTime}>
                    {new Date(entry.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
              <Text style={[styles.logXP, { color: entry.xp > 0 ? COLORS.emerald : COLORS.decay }]}>
                {entry.xp > 0 ? "+" : ""}{entry.xp}
              </Text>
            </View>
          ))}
        </GlassPanel>

        {/* Trust Gravity Note */}
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
            { label: "Over EchoMatch", sub: "Versie & missie", icon: "information-circle-outline", route: "/about" },
            { label: "Privacybeleid", sub: "Hoe wij jouw data beschermen", icon: "shield-outline", route: "/privacy" },
            { label: "Algemene Voorwaarden", sub: "Gebruiksregels & Plus", icon: "document-text-outline", route: "/terms" },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(item.route as any); }}
              style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuRowBorder, pressed && { opacity: 0.7 }]}
            >
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
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_700Bold",
    letterSpacing: -0.5,
  },
  pageSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  adminBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(192,200,216,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
  },
  profileCard: { padding: 16, marginBottom: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,224,122,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  profileAvatarEmoji: { fontSize: 26 },
  profileName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  profileLevel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, marginTop: 2 },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
    backgroundColor: "rgba(192,200,216,0.05)",
  },
  previewBtnActive: {
    borderColor: COLORS.emeraldBorder,
    backgroundColor: "rgba(0,224,122,0.08)",
  },
  previewText: { color: COLORS.silver, fontFamily: "Outfit_500Medium", fontSize: 13 },
  profilePreview: { marginTop: 12 },
  previewDivider: { height: 1, backgroundColor: COLORS.silverBorder, marginBottom: 12 },
  previewLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginBottom: 10 },
  previewMeters: { flexDirection: "row", justifyContent: "space-between" },
  previewMeter: { alignItems: "center", gap: 4 },
  previewMeterLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: "Outfit_400Regular" },
  previewMeterVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    padding: 14,
    flex: 1,
    minWidth: "45%",
    gap: 6,
    alignItems: "flex-start",
  },
  statValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  statLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12 },
  sectionTitle: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  chartCard: { padding: 16, marginBottom: 20 },
  fullLog: { overflow: "hidden", marginBottom: 16 },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  logBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
  logTime: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10, marginTop: 1 },
  logXP: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  gravityNote: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  gravityTitle: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13, marginBottom: 4 },
  gravityText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, lineHeight: 18 },
  menuCard: { overflow: "hidden", marginBottom: 20 },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(168,85,247,0.12)", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(168,85,247,0.25)",
  },
  menuLabel: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  menuSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
});
