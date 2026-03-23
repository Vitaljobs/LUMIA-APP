import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [notifVotes, setNotifVotes] = useState(true);
  const [notifFriends, setNotifFriends] = useState(true);
  const [notifXP, setNotifXP] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      if (window.confirm("Weet je zeker dat je wilt uitloggen?")) {
        AsyncStorage.removeItem("lumia_onboarding_done").then(() => {
          router.replace("/onboarding");
        });
      }
    } else {
      Alert.alert(
        "Uitloggen",
        "Weet je zeker dat je wilt uitloggen?",
        [
          { text: "Annuleren", style: "cancel" },
          {
            text: "Uitloggen",
            style: "destructive",
            onPress: () => {
              AsyncStorage.removeItem("lumia_onboarding_done").then(() => {
                router.replace("/onboarding");
              });
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (Platform.OS === "web") {
      if (window.confirm("Je account en alle data worden PERMANENT verwijderd. Dit kan niet ongedaan worden gemaakt.")) {
        AsyncStorage.clear().then(() => router.replace("/onboarding"));
      } else {
        setDeleteConfirm(false);
      }
    } else {
      Alert.alert(
        "Account definitief verwijderen?",
        "Je account en alle data worden PERMANENT verwijderd. Dit kan niet ongedaan worden gemaakt.",
        [
          { text: "Annuleren", style: "cancel", onPress: () => setDeleteConfirm(false) },
          {
            text: "Verwijder Account",
            style: "destructive",
            onPress: () => {
              AsyncStorage.clear().then(() => router.replace("/onboarding"));
            },
          },
        ]
      );
    }
  };

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
            <Ionicons name="settings" size={22} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.title}>Instellingen</Text>
            <Text style={styles.sub}>Account & voorkeuren</Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Meldingen</Text>
        <GlassPanel style={styles.toggleCard}>
          {[
            { label: "Stemmen op stellingen", sub: "Ontvang melding als iemand stemt", value: notifVotes, onChange: setNotifVotes },
            { label: "Vriendverzoeken", sub: "Nieuwe vriendschapsverzoeken", value: notifFriends, onChange: setNotifFriends },
            { label: "XP Gifts", sub: "Ontvangst van XP via chat", value: notifXP, onChange: setNotifXP },
            { label: "Systeemupdates", sub: "Trust Score wijzigingen & nieuws", value: notifSystem, onChange: setNotifSystem },
          ].map((item, i) => (
            <View key={i} style={[styles.toggleRow, i > 0 && styles.rowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={(v) => { item.onChange(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: PURPLE_BG }}
                thumbColor={item.value ? PURPLE : COLORS.silver}
                ios_backgroundColor="rgba(255,255,255,0.1)"
              />
            </View>
          ))}
        </GlassPanel>

        {/* Info links */}
        <Text style={styles.sectionTitle}>Informatie</Text>
        <GlassPanel style={styles.linksCard}>
          {[
            { label: "Privacybeleid", icon: "shield-outline", onPress: () => router.push("/privacy") },
            { label: "Algemene Voorwaarden", icon: "document-text-outline", onPress: () => router.push("/terms") },
            { label: "Help & Support", icon: "help-circle-outline", onPress: () => router.push("/help") },
            { label: "Over EchoMatch", icon: "information-circle-outline", onPress: () => router.push("/about") },
          ].map((link, i) => (
            <Pressable
              key={i}
              onPress={link.onPress}
              style={({ pressed }) => [styles.linkRow, i > 0 && styles.rowBorder, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={link.icon as any} size={18} color={PURPLE} />
              <Text style={styles.linkText}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </GlassPanel>

        {/* Account actions */}
        <Text style={styles.sectionTitle}>Account</Text>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.silver} />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </Pressable>

        {/* Delete account */}
        <Pressable
          onPress={handleDeleteAccount}
          style={({ pressed }) => [
            styles.deleteBtn,
            deleteConfirm && styles.deleteBtnConfirm,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons
            name={deleteConfirm ? "warning" : "trash-outline"}
            size={20}
            color={COLORS.decay}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.deleteText}>
              {deleteConfirm ? "Nogmaals drukken om te bevestigen" : "Account verwijderen"}
            </Text>
            {deleteConfirm && (
              <Text style={styles.deleteSub}>Alle data wordt permanent verwijderd</Text>
            )}
          </View>
          {deleteConfirm && (
            <View style={styles.deleteBadge}>
              <Text style={styles.deleteBadgeText}>Onomkeerbaar</Text>
            </View>
          )}
        </Pressable>

        {!deleteConfirm && (
          <Text style={styles.deleteHint}>
            Je account en alle bijbehorende data worden permanent verwijderd.
          </Text>
        )}
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
  toggleCard: { overflow: "hidden", marginBottom: 20 },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  toggleLabel: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  toggleSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
  linksCard: { overflow: "hidden", marginBottom: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  linkText: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 14 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 16, marginBottom: 10,
    backgroundColor: "rgba(192,200,216,0.07)",
    borderWidth: 1, borderColor: COLORS.silverBorder,
  },
  logoutText: { color: COLORS.silver, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 16, marginBottom: 8,
    backgroundColor: "rgba(255,77,77,0.07)",
    borderWidth: 1, borderColor: "rgba(255,77,77,0.2)",
  },
  deleteBtnConfirm: {
    backgroundColor: "rgba(255,77,77,0.15)",
    borderColor: "rgba(255,77,77,0.4)",
  },
  deleteText: { color: COLORS.decay, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  deleteSub: { color: "rgba(255,77,77,0.6)", fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 2 },
  deleteBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: "rgba(255,77,77,0.15)", borderWidth: 1, borderColor: "rgba(255,77,77,0.3)",
  },
  deleteBadgeText: { color: COLORS.decay, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 10 },
  deleteHint: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, textAlign: "center", marginBottom: 8 },
});
