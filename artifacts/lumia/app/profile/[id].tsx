import { Ionicons } from "@expo/vector-icons";
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

const SIZE = 80;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function MiniMeter({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const strokeDash = (pct / 100) * CIRC;
  return (
    <Svg width={SIZE} height={SIZE}>
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
      <Circle
        cx={SIZE / 2} cy={SIZE / 2} r={R}
        stroke={color} strokeWidth={STROKE} fill="none"
        strokeDasharray={`${strokeDash} ${CIRC}`}
        strokeLinecap="round"
        transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
      />
    </Svg>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friends, meters, user } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const friend = friends.find((f) => f.id === id);
  const isOwnProfile = id === user.id || !id;
  const profile = isOwnProfile
    ? { name: user.name, avatar: user.avatar, honor: meters.honor, vitality: meters.vitality, xp: user.xp, isOnline: true }
    : friend;

  if (!profile) {
    return (
      <DualGlowBackground style={{ flex: 1 }}>
        <View style={[styles.center, { paddingTop: topPadding }]}>
          <Text style={styles.notFound}>Profiel niet gevonden</Text>
          <Pressable onPress={() => router.back()} style={styles.backPressable}>
            <Text style={styles.backText}>Terug</Text>
          </Pressable>
        </View>
      </DualGlowBackground>
    );
  }

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.silver} />
          </Pressable>
          <Text style={styles.headerTitle}>Profiel</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.profileHero}>
          <Text style={styles.avatarText}>{profile.avatar}</Text>
          {profile.isOnline && <View style={styles.onlineDot} />}
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileXP}>{profile.xp?.toLocaleString()} XP</Text>
        </View>

        <View style={styles.metersRow}>
          {[
            { label: "Honor", value: profile.honor, color: COLORS.honor },
            { label: "Vitality", value: profile.vitality, color: COLORS.vitality },
          ].map((m) => (
            <GlassPanel key={m.label} style={styles.meterCard}>
              <MiniMeter value={m.value} color={m.color} />
              <Text style={[styles.meterVal, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.meterLabel}>{m.label}</Text>
            </GlassPanel>
          ))}
        </View>

        <GlassPanel variant="emerald" style={styles.trustNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.emerald} />
          <Text style={styles.trustText}>
            Trust-Gravity score: <Text style={{ color: COLORS.emerald, fontFamily: "SpaceGrotesk_700Bold" }}>
              {(profile.honor / 100).toFixed(2)}x
            </Text>
          </Text>
        </GlassPanel>
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { color: COLORS.textMuted, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16 },
  backPressable: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.silverBorder },
  backText: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 18 },
  profileHero: { alignItems: "center", marginBottom: 24, position: "relative" },
  avatarText: { fontSize: 64, marginBottom: 8 },
  onlineDot: { position: "absolute", top: 50, right: "35%", width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.emerald, borderWidth: 2, borderColor: COLORS.bg },
  profileName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, marginBottom: 4 },
  profileXP: { color: COLORS.xpGold, fontFamily: "Outfit_500Medium", fontSize: 14 },
  metersRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  meterCard: { flex: 1, alignItems: "center", padding: 16, gap: 6 },
  meterVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24 },
  meterLabel: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12 },
  trustNote: { padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  trustText: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13 },
});
