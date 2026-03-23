import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

type SetupStatus = {
  ready: boolean;
  tables: Record<string, boolean>;
  sql?: string;
};

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user, meters, friends, statements, xpLog, projectId } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/lumia/setup/status`)
      .then((r) => r.json())
      .then(setSetupStatus)
      .catch(() => setSetupStatus(null))
      .finally(() => setLoadingSetup(false));
  }, []);

  const handleCopySQL = async () => {
    if (!setupStatus?.sql) return;
    await Clipboard.setStringAsync(setupStatus.sql);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setCopied(false), 3000);
  };

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

  const meterItems = [
    { key: "honor" as const, label: "Honor", color: COLORS.honor },
    { key: "reflectie" as const, label: "Reflectie", color: COLORS.shame },
    { key: "vitality" as const, label: "Vitality", color: COLORS.vitality },
    { key: "decay" as const, label: "Decay", color: COLORS.decay },
  ];

  const tableNames = [
    "meters", "xp_log", "statements", "statement_votes",
    "friends", "friend_requests", "messages", "notifications",
  ];
  const readyCount = setupStatus ? Object.values(setupStatus.tables).filter(Boolean).length : 0;

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
          <View style={styles.adminBadge}>
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
              <Text style={styles.rlsText}>Insforge</Text>
            </View>
          </View>
        </GlassPanel>

        {/* ── Database Setup Status ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Database Status</Text>
        <GlassPanel
          style={[
            styles.dbCard,
            setupStatus?.ready ? styles.dbCardReady : styles.dbCardWarning,
          ]}
        >
          {loadingSetup ? (
            <View style={styles.dbLoading}>
              <ActivityIndicator color={COLORS.silver} size="small" />
              <Text style={styles.dbLoadingText}>Verbinding controleren...</Text>
            </View>
          ) : setupStatus === null ? (
            <View style={styles.dbRow}>
              <Ionicons name="alert-circle" size={18} color={COLORS.decay} />
              <Text style={styles.dbStatusText}>Kan geen verbinding maken met backend</Text>
            </View>
          ) : (
            <>
              <View style={styles.dbRow}>
                <Ionicons
                  name={setupStatus.ready ? "checkmark-circle" : "alert-circle"}
                  size={18}
                  color={setupStatus.ready ? COLORS.emerald : COLORS.xpGold}
                />
                <Text style={[styles.dbStatusText, { color: setupStatus.ready ? COLORS.emerald : COLORS.xpGold }]}>
                  {setupStatus.ready
                    ? "Database volledig opgezet"
                    : `${readyCount}/8 tabellen aangemaakt`}
                </Text>
              </View>

              {/* Table status grid */}
              <View style={styles.tableGrid}>
                {tableNames.map((t) => {
                  const exists = setupStatus.tables[t];
                  return (
                    <View key={t} style={styles.tableItem}>
                      <Ionicons
                        name={exists ? "checkmark-circle" : "ellipse-outline"}
                        size={12}
                        color={exists ? COLORS.emerald : COLORS.textMuted}
                      />
                      <Text style={[styles.tableName, exists && { color: COLORS.textSecondary }]}>
                        lumia_{t}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* SQL setup button */}
              {!setupStatus.ready && (
                <View style={styles.sqlSection}>
                  <Text style={styles.sqlHint}>
                    Kopieer de SQL en voer deze uit in het Insforge dashboard (SQL Editor) om de tabellen aan te maken.
                  </Text>
                  <View style={styles.sqlBtnRow}>
                    <Pressable
                      onPress={handleCopySQL}
                      style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.8 }]}
                    >
                      <Ionicons
                        name={copied ? "checkmark-circle" : "copy-outline"}
                        size={16}
                        color={copied ? COLORS.emerald : COLORS.xpGold}
                      />
                      <Text style={[styles.copyBtnText, copied && { color: COLORS.emerald }]}>
                        {copied ? "Gekopieerd!" : "Kopieer SQL Migratie"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { setShowSQL(!showSQL); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={styles.previewBtn}
                    >
                      <Text style={styles.previewBtnText}>{showSQL ? "Verberg" : "Voorbeeld"}</Text>
                    </Pressable>
                  </View>

                  {showSQL && setupStatus.sql && (
                    <ScrollView horizontal showsHorizontalScrollIndicator style={styles.sqlPreview}>
                      <Text style={styles.sqlCode}>{setupStatus.sql.trim()}</Text>
                    </ScrollView>
                  )}
                </View>
              )}
            </>
          )}
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
          {meterItems.map((m, i) => (
            <View key={m.key} style={[styles.meterRow, i > 0 && styles.meterRowBorder]}>
              <Text style={styles.meterName}>{m.label}</Text>
              <View style={styles.meterRight}>
                <View style={styles.meterBar}>
                  <View
                    style={[
                      styles.meterBarFill,
                      { width: `${meters[m.key]}%` as any, backgroundColor: m.color },
                    ]}
                  />
                </View>
                <Text style={[styles.meterVal, { color: m.color }]}>{meters[m.key]}</Text>
              </View>
            </View>
          ))}
        </GlassPanel>

        {/* Database security */}
        <Text style={styles.sectionTitle}>Database Beveiliging</Text>
        <GlassPanel style={styles.rlsCard}>
          {[
            { label: "Project isolatie", status: "LUMIA_2026", ok: true },
            { label: "Tabel prefix", status: "lumia_*", ok: true },
            { label: "Credentials", status: "Server-side only", ok: true },
            { label: "Insforge SDK", status: "v1.2.0", ok: true },
          ].map((row, i) => (
            <View key={i} style={[styles.rlsRow, i > 0 && styles.rlsRowBorder]}>
              <Feather name={row.ok ? "check-circle" : "alert-circle"} size={14} color={row.ok ? COLORS.emerald : COLORS.decay} />
              <Text style={styles.rlsLabel}>{row.label}</Text>
              <Text style={styles.rlsStatus}>{row.status}</Text>
            </View>
          ))}
        </GlassPanel>

        {/* Users */}
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
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.silverBorder,
  },
  backBtn2Text: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center",
  },
  adminTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 20 },
  adminSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10 },
  adminBadge: {
    marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: "rgba(0,224,122,0.1)", borderWidth: 1, borderColor: COLORS.emeraldBorder,
  },
  adminBadgeText: { color: COLORS.emerald, fontFamily: "SpaceGrotesk_700Bold", fontSize: 11 },
  projectCard: { padding: 16, marginBottom: 20 },
  projectRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  projectName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  projectId: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  rlsBadge: {
    marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: "rgba(0,224,122,0.12)",
  },
  rlsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.emerald },
  rlsText: { color: COLORS.emerald, fontFamily: "Outfit_500Medium", fontSize: 11 },
  sectionTitle: {
    color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 4,
  },
  // DB card
  dbCard: { padding: 14, marginBottom: 20 },
  dbCardReady: { borderColor: COLORS.emeraldBorder },
  dbCardWarning: { borderColor: "rgba(255,215,0,0.25)" },
  dbLoading: { flexDirection: "row", alignItems: "center", gap: 10 },
  dbLoadingText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
  dbRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  dbStatusText: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  tableGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tableItem: { flexDirection: "row", alignItems: "center", gap: 4, width: "48%" },
  tableName: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10 },
  sqlSection: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 12 },
  sqlHint: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  sqlBtnRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  copyBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 11, borderRadius: 10,
    backgroundColor: "rgba(255,215,0,0.1)", borderWidth: 1, borderColor: "rgba(255,215,0,0.3)",
  },
  copyBtnText: { color: COLORS.xpGold, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  previewBtn: {
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: COLORS.silverBorder,
  },
  previewBtnText: { color: COLORS.silver, fontFamily: "Outfit_500Medium", fontSize: 13 },
  sqlPreview: {
    maxHeight: 200, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sqlCode: { color: COLORS.emerald, fontFamily: "Outfit_400Regular", fontSize: 10, lineHeight: 16 },
  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { padding: 14, flex: 1, minWidth: "45%", gap: 6 },
  statValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18 },
  statLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  // Meters
  metersCard: { overflow: "hidden", marginBottom: 20 },
  meterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13,
  },
  meterRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  meterName: { color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 13 },
  meterRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  meterBar: { width: 80, height: 5, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" },
  meterBarFill: { height: "100%" as any, borderRadius: 3 },
  meterVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, width: 30, textAlign: "right" },
  // RLS
  rlsCard: { overflow: "hidden", marginBottom: 20 },
  rlsRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  rlsRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  rlsLabel: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
  rlsStatus: { color: COLORS.textMuted, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 11 },
  // Users
  userRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  userRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  userAvatar: { fontSize: 22 },
  userName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  userId: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 10 },
  adminTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: "rgba(0,224,122,0.1)", borderWidth: 1, borderColor: COLORS.emeraldBorder,
  },
  adminTagText: { color: COLORS.emerald, fontSize: 10, fontFamily: "SpaceGrotesk_600SemiBold" },
  userHonor: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, width: 30, textAlign: "right" },
});
