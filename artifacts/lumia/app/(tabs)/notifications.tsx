import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useLumia } from "@/context/LumiaContext";
import { Notification } from "@/context/LumiaContext";

const NOTIF_ICONS: Record<Notification["type"], { icon: string; color: string }> = {
  xp_gift: { icon: "star", color: COLORS.xpGold },
  friend_request: { icon: "person-add", color: COLORS.emerald },
  vote: { icon: "stats-chart", color: COLORS.silver },
  honor_change: { icon: "shield-checkmark", color: COLORS.honor },
  message: { icon: "chatbubble", color: COLORS.vitality },
  system: { icon: "information-circle", color: COLORS.silver },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m geleden`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}u geleden`;
  return `${Math.floor(diff / 86400000)}d geleden`;
}

function NotifCard({ notif, onRead }: { notif: Notification; onRead: () => void }) {
  const meta = NOTIF_ICONS[notif.type];
  return (
    <Pressable
      onPress={() => { if (!notif.read) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRead(); } }}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
    >
      <GlassPanel
        style={[
          styles.notifCard,
          !notif.read && styles.notifCardUnread,
        ]}
      >
        {/* Unread dot */}
        {!notif.read && <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />}

        <View style={[styles.iconWrap, { borderColor: meta.color + "30", backgroundColor: meta.color + "12" }]}>
          <Ionicons name={meta.icon as any} size={18} color={meta.color} />
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
              {notif.title}
            </Text>
            <Text style={styles.notifTime}>{timeAgo(notif.timestamp)}</Text>
          </View>
          <Text style={styles.notifBody}>{notif.body}</Text>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotifCount } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 90;

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <DualGlowBackground style={{ flex: 1 }}>
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
            <Text style={styles.pageTitle}>Meldingen</Text>
            {unreadNotifCount > 0 && (
              <Text style={styles.pageSubtitle}>{unreadNotifCount} ongelezen</Text>
            )}
          </View>
          {unreadNotifCount > 0 && (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); markAllNotificationsRead(); }}
              style={styles.markAllBtn}
            >
              <Ionicons name="checkmark-done" size={14} color={COLORS.emerald} />
              <Text style={styles.markAllText}>Alles gelezen</Text>
            </Pressable>
          )}
        </View>

        {/* Unread */}
        {unread.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Nieuw</Text>
            {unread.map((n) => (
              <NotifCard key={n.id} notif={n} onRead={() => markNotificationRead(n.id)} />
            ))}
          </>
        )}

        {/* Read */}
        {read.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Eerder</Text>
            {read.map((n) => (
              <NotifCard key={n.id} notif={n} onRead={() => markNotificationRead(n.id)} />
            ))}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Geen meldingen</Text>
            <Text style={styles.emptyText}>Je bent helemaal bij!</Text>
          </View>
        )}
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
  pageSubtitle: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, marginTop: 2 },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,224,122,0.10)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  markAllText: { color: COLORS.emerald, fontFamily: "Outfit_600SemiBold", fontSize: 12 },
  sectionLabel: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  notifCard: {
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  notifCardUnread: {
    borderColor: "rgba(255,255,255,0.14)",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 3,
  },
  notifTitle: {
    color: COLORS.textSecondary,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    flex: 1,
  },
  notifTitleUnread: {
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  notifTime: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, flexShrink: 0 },
  notifBody: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, lineHeight: 18 },
  empty: { alignItems: "center", gap: 10, marginTop: 80 },
  emptyTitle: { color: COLORS.textSecondary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16 },
  emptyText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13 },
});
