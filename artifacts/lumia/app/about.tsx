import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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

const PURPLE = "#A855F7";
const PURPLE_BG = "rgba(168,85,247,0.12)";
const PURPLE_BORDER = "rgba(168,85,247,0.25)";

const APP_VERSION = "2026.1.0";
const BUILD_NUMBER = "20260101";

const FEATURES = [
  { icon: "shield-checkmark-outline", label: "4 Trust Meters", desc: "Honor, Reflectie, Vitality & Decay" },
  { icon: "trending-up-outline", label: "Trust-Gravity", desc: "Gewogen stemmen op basis van Honor" },
  { icon: "leaf-outline", label: "Levende Tuin", desc: "Visuele weerspiegeling van jouw Vitality" },
  { icon: "flash-outline", label: "XP Logboek", desc: "Realtime tracking van jouw activiteiten" },
  { icon: "chatbubbles-outline", label: "XP Gifting", desc: "Beloon vrienden met XP in chat" },
  { icon: "people-outline", label: "Community", desc: "Stem op stellingen met Trust-Gravity" },
];

const TEAM = [
  { role: "Concept & Design", name: "Lumia Studio" },
  { role: "Platform Architect", name: "Trust Systems Lab" },
  { role: "Community Lead", name: "Lumia Team" },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.silver} />
          </Pressable>
          <View style={styles.headerIcon}>
            <Ionicons name="information-circle" size={22} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.title}>Over Lumia</Text>
            <Text style={styles.sub}>Versie {APP_VERSION}</Text>
          </View>
        </View>

        {/* Logo / Brand card */}
        <GlassPanel style={[styles.brandCard, { borderColor: PURPLE_BORDER }]}>
          <View style={styles.logoWrap}>
            <Ionicons name="shield-checkmark" size={40} color={PURPLE} />
          </View>
          <Text style={styles.brandName}>Lumia</Text>
          <Text style={styles.brandTagline}>Het Elite Trust Platform</Text>
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v{APP_VERSION}</Text>
            </View>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Build {BUILD_NUMBER}</Text>
            </View>
          </View>
        </GlassPanel>

        {/* Missie */}
        <GlassPanel style={styles.missionCard}>
          <Text style={styles.missionLabel}>Onze Missie</Text>
          <Text style={styles.missionText}>
            Lumia gelooft dat eerlijkheid en betrouwbaarheid de basis vormen van betekenisvolle verbindingen. Ons platform maakt vertrouwen meetbaar, zichtbaar en groeiend — zodat jij weet met wie je te maken hebt en anderen weten wie jij bent.
          </Text>
          <Text style={styles.missionText}>
            Via de 4 Trust Meters — Honor, Reflectie, Vitality en Decay — krijg je inzicht in jouw eigen gedragspatronen en die van je netwerk. Trust-Gravity zorgt ervoor dat eerlijkheid wordt beloond: hoe hoger jouw Honor, hoe zwaarder jouw stem telt.
          </Text>
        </GlassPanel>

        {/* Features */}
        <Text style={styles.sectionTitle}>Platform Functies</Text>
        <GlassPanel style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i > 0 && styles.featureBorder]}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon as any} size={18} color={PURPLE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </GlassPanel>

        {/* Team */}
        <Text style={styles.sectionTitle}>Team</Text>
        <GlassPanel style={styles.teamCard}>
          {TEAM.map((t, i) => (
            <View key={i} style={[styles.teamRow, i > 0 && styles.teamBorder]}>
              <Text style={styles.teamRole}>{t.role}</Text>
              <Text style={styles.teamName}>{t.name}</Text>
            </View>
          ))}
        </GlassPanel>

        {/* Links */}
        <Text style={styles.sectionTitle}>Meer informatie</Text>
        <GlassPanel style={styles.linksCard}>
          {[
            { label: "Privacybeleid", icon: "shield-outline", onPress: () => router.push("/privacy") },
            { label: "Algemene Voorwaarden", icon: "document-text-outline", onPress: () => router.push("/terms") },
            { label: "Help & Support", icon: "help-circle-outline", onPress: () => router.push("/help") },
          ].map((link, i) => (
            <Pressable
              key={i}
              onPress={link.onPress}
              style={({ pressed }) => [styles.linkRow, i > 0 && styles.linkBorder, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={link.icon as any} size={18} color={PURPLE} />
              <Text style={styles.linkText}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </GlassPanel>

        <Text style={styles.copyright}>© 2026 Lumia B.V. · Amsterdam, Nederland</Text>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center",
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: PURPLE_BG, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  title: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 20 },
  sub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  sectionTitle: {
    color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 4,
  },
  brandCard: {
    alignItems: "center", padding: 28, marginBottom: 16,
    borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: PURPLE_BG, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: PURPLE_BORDER, marginBottom: 12,
  },
  brandName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, letterSpacing: -0.5 },
  brandTagline: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13, marginTop: 4, marginBottom: 14 },
  versionRow: { flexDirection: "row", gap: 8 },
  versionBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: COLORS.silverBorder,
  },
  versionText: { color: COLORS.textMuted, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 11 },
  missionCard: { padding: 16, gap: 10, marginBottom: 20 },
  missionLabel: { color: PURPLE, fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" },
  missionText: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 22 },
  featuresCard: { overflow: "hidden", marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  featureBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: PURPLE_BG, alignItems: "center", justifyContent: "center",
  },
  featureLabel: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  featureDesc: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
  teamCard: { overflow: "hidden", marginBottom: 20 },
  teamRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13 },
  teamBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  teamRole: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
  teamName: { color: COLORS.textSecondary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  linksCard: { overflow: "hidden", marginBottom: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  linkText: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 14 },
  copyright: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, textAlign: "center", marginBottom: 8 },
});
