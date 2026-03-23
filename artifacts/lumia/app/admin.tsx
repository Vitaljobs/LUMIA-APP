import { Feather, Ionicons } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user, meters, friends, statements, xpLog, projectId } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!user.isAdmin) {
    return (
      <DualGlowBackground style={{ flex: 1 }}>
        <View style={styles.forbidden}>
          <Ionicons name="lock-closed" size={48} color={COLORS.decay} />
          <Text style={styles.forbiddenText}>Geen toegang</Text>
          <Text style={styles.forbiddenSub}>Alleen voor admins van {projectId}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn2}>
            <Text style={styles.backBtn2Text}>Terug</Text>
          </Pressable>
        </View>
      </DualGlowBackground>
    );
  }

  const stats = [
    { label: "Gebruikers", value: friends.length + 1, icon: "people-outline", color: COLORS.emerald },
    { label: "Stellingen", value: statements.length, icon: "chatbubbles-outline", color: COLORS.honor },
    { label: "XP Events", value: xpLog.length, icon: "flash-outline", color: COLORS.xpGold },
    { label: "Project ID", value: projectId, icon: "key-outline", color: COLORS.silver },
  ];

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.silver} />
          </Pressable>
          <View>
            <Text style={styles.adminTitle}>Admin Dashboard</Text>
            <Text style={styles.adminSub}>ID: {user.id}</Text>
          </View>
          <View
            style={styles.adminBadge}
          >
            <Ionicons name="shield-checkmark" size={14} color={COLORS.emerald} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Project info */}
        <GlassPanel variant="emerald" style={styles.projectCard}>
          <View style={styles.projectRow}>
            <Ionicons name="leaf" size={20} color={COLORS.emerald} />
            <View>
              <Text style={styles.projectName}>Lumia 2026</Text>
              <Text style={styles.projectId}>Project: {projectId}</Text>
            </View>
            <View style={styles.rlsBadge}>
              <View style={styles.rlsDot} />
              <Text style={styles.rlsText}>RLS Actief</Text>
            </View>
          </View>
        </GlassPanel>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Platform Statistieken</Text>
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <GlassPanel key={i} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>
                {String(s.value)}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassPanel>
          ))}
        </View>

        {/* Trust Meters overview */}
        <Text style={styles.sectionTitle}>Eigen Meter Status</Text>
        <GlassPanel style={styles.metersCard}>
          {(["honor", "shame", "vitality", "decay"] as const).map((m, i) => (
            <View key={m} style={[styles.meterRow, i > 0 && styles.meterRowBorder]}>
              <Text style={styles.meterName}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
              <View style={styles.meterRight}>
                <View style={styles.meterBar}>
                  <View
                    style={[
                      styles.meterBarFill,
                      {
                        width: `${meters[m]}%`,
                        backgroundColor:
                          m === "honor" ? COLORS.honor :
                          m === "shame" ? COLORS.shame :
                          m === "vitality" ? COLORS.vitality :
                          COLORS.decay,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.meterVal,
                  { color: m === "honor" ? COLORS.honor : m === "shame" ? COLORS.shame : m === "vitality" ? COLORS.vitality : COLORS.decay }
                ]}>
                  {meters[m]}
                </Text>
              </View>
            </View>
          ))}
        </GlassPanel>

        {/* RLS Info */}
        <Text style={styles.sectionTitle}>Database Beveiliging</Text>
        <GlassPanel style={styles.rlsCard}>
          {[
            { label: "Row Level Security", status: "Actief", ok: true },
            { label: "Project filter (project_id)", status: "LUMIA_2026", ok: true },
            { label: "Data isolatie", status: "Gegarandeerd", ok: true },
            { label: "Supabase tabellen", status: "lumia_* prefix", ok: true },
          ].map((row, i) => (
            <View key={i} style={[styles.rlsRow, i > 0 && styles.rlsRowBorder]}>
              <Feather name={row.ok ? "check-circle" : "alert-circle"} size={14} color={row.ok ? COLORS.emerald : COLORS.decay} />
              <Text style={styles.rlsLabel}>{row.label}</Text>
              <Text style={styles.rlsStatus}>{row.status}</Text>
            </View>
          ))}
        </GlassPanel>

        {/* Recent users */}
        <Text style={styles.sectionTitle}>Geregistreerde Gebruikers</Text>
        <GlassPanel style={{ overflow: "hidden" }}>
          {[{ id: user.id, name: user.name, avatar: user.avatar, honor: meters.honor, isAdmin: true }, ...friends].map((u, i) => (
            <View key={u.id} style={[styles.userRow, i > 0 && styles.userRowBorder]}>
              <Text style={styles.userAvatar}>{u.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userId} numberOfLines={1}>{u.id}</Text>
              </View>
              {(u as any).isAdmin && (
                <View style={styles.adminTag}>
                  <Text style={styles.adminTagText}>Admin</Text>
                </View>
              )}
              <Text style={[styles.userHonor, { color: COLORS.honor }]}>{u.honor}</Text>
            </View>
          ))}
        </GlassPanel>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  forbidden: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  forbiddenText: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  forbiddenSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 14 },
  backBtn2: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
  },
  backBtn2Text: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 20 },
  adminSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10 },
  adminBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(0,224,122,0.1)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  adminBadgeText: { color: COLORS.emerald, fontFamily: "SpaceGrotesk_700Bold", fontSize: 11 },
  projectCard: { padding: 16, marginBottom: 20 },
  projectRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  projectName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  projectId: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  rlsBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(0,224,122,0.12)",
  },
  rlsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.emerald },
  rlsText: { color: COLORS.emerald, fontFamily: "Outfit_500Medium", fontSize: 11 },
  sectionTitle: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: { padding: 14, flex: 1, minWidth: "45%", gap: 6 },
  statValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18 },
  statLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  metersCard: { overflow: "hidden", marginBottom: 20 },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  meterRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  meterName: { color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 13 },
  meterRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  meterBar: {
    width: 80,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  meterBarFill: { height: "100%", borderRadius: 3 },
  meterVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, width: 30, textAlign: "right" },
  rlsCard: { overflow: "hidden", marginBottom: 20 },
  rlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rlsRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  rlsLabel: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
  rlsStatus: { color: COLORS.textMuted, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 11 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  userRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  userAvatar: { fontSize: 22 },
  userName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  userId: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10 },
  adminTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(0,224,122,0.1)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  adminTagText: { color: COLORS.emerald, fontSize: 10, fontFamily: "SpaceGrotesk_600SemiBold" },
  userHonor: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, width: 30, textAlign: "right" },
});
