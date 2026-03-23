import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Lumia</Text>
            <Text style={styles.brandSub}>Elite Trust Platform</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (user.isAdmin) router.push("/admin");
            }}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={["rgba(0,224,122,0.3)", "rgba(192,200,216,0.2)"]}
              style={styles.avatarGrad}
            >
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
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

        {/* XP Logboek */}
        <Text style={styles.sectionTitle}>XP Logboek</Text>
        <GlassPanel style={styles.logPanel}>
          {xpLog.slice(0, 5).map((entry, i) => (
            <View key={entry.id} style={[styles.logEntry, i > 0 && styles.logEntryBorder]}>
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
                <Text style={styles.logAction} numberOfLines={1}>
                  {entry.action}
                </Text>
              </View>
              <Text
                style={[
                  styles.logXP,
                  { color: entry.xp > 0 ? COLORS.emerald : COLORS.decay },
                ]}
              >
                {entry.xp > 0 ? "+" : ""}{entry.xp} XP
              </Text>
            </View>
          ))}
          <Pressable
            style={styles.viewAllBtn}
            onPress={() => router.push("/dashboard")}
          >
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 36,
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_700Bold",
    letterSpacing: -1,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
    marginTop: -2,
  },
  avatarBtn: { position: "relative" },
  avatarGrad: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  avatarEmoji: { fontSize: 24 },
  xpBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.emerald,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  xpText: { color: "#000", fontSize: 9, fontFamily: "SpaceGrotesk_700Bold" },
  levelPanel: { padding: 14, marginBottom: 20 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelLabel: {
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 14,
  },
  xpLabel: {
    color: COLORS.textMuted,
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  levelBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  levelBarFill: { height: "100%", borderRadius: 3 },
  sectionTitle: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  metersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gardenPanel: { padding: 16, marginBottom: 20 },
  logPanel: { padding: 0, marginBottom: 20, overflow: "hidden" },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  logEntryBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: {
    color: COLORS.textSecondary,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    flex: 1,
  },
  logXP: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  viewAllText: {
    color: COLORS.emerald,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
  },
});
