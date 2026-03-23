import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";
import { ChatThread, Friend } from "@/context/LumiaContext";

function FriendRequestCard({ request, onAccept, onDecline }: {
  request: { id: string; from: Friend; timestamp: number };
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <GlassPanel style={styles.requestCard}>
      <View style={styles.requestLeft}>
        <View style={styles.requestAvatar}>
          <Text style={styles.requestAvatarEmoji}>{request.from.avatar}</Text>
          {request.from.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View>
          <Text style={styles.requestName}>{request.from.name}</Text>
          <View style={styles.requestStats}>
            <Ionicons name="shield" size={10} color={COLORS.honor} />
            <Text style={styles.requestStat}>{request.from.honor}</Text>
            <Ionicons name="heart" size={10} color={COLORS.vitality} style={{ marginLeft: 6 }} />
            <Text style={styles.requestStat}>{request.from.vitality}</Text>
          </View>
        </View>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDecline(); }}
          style={styles.declineBtn}
        >
          <Feather name="x" size={16} color={COLORS.decay} />
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAccept(); }}
          style={styles.acceptBtn}
        >
          <Feather name="check" size={16} color={COLORS.emerald} />
          <Text style={styles.acceptText}>Accepteer</Text>
        </Pressable>
      </View>
    </GlassPanel>
  );
}

function ChatCard({ chat, onPress }: { chat: ChatThread; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
      <GlassPanel style={styles.chatCard}>
        <View style={styles.chatAvatar}>
          <Text style={styles.chatAvatarEmoji}>{chat.friend.avatar}</Text>
          {chat.friend.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chat.friend.name}</Text>
            {chat.messages.length > 0 && (
              <Text style={styles.chatTime}>
                {Math.floor((Date.now() - chat.messages[chat.messages.length - 1].timestamp) / 3600000)}u
              </Text>
            )}
          </View>
          <Text style={styles.chatLast} numberOfLines={1}>
            {chat.lastMessage ?? "Geen berichten"}
          </Text>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

function ChatModal({ chat, onClose }: { chat: ChatThread; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [showXP, setShowXP] = useState(false);
  const { sendMessage } = useLumia();
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (!msg.trim()) return;
    const xp = showXP && xpAmount ? parseInt(xpAmount) : undefined;
    sendMessage(chat.id, msg.trim(), xp);
    setMsg("");
    setXpAmount("");
    setShowXP(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.chatModal, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={styles.chatModalHeader}>
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={22} color={COLORS.silver} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.chatModalName}>{chat.friend.name}</Text>
          <Text style={styles.chatModalStatus}>
            {chat.friend.isOnline ? "• Online" : "Offline"}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Messages */}
      <FlatList
        data={chat.messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item: m }) => {
          const isMe = m.senderId !== chat.friend.id;
          return (
            <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
              <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                {m.xpGift && (
                  <View style={styles.xpGiftBadge}>
                    <Ionicons name="star" size={12} color={COLORS.xpGold} />
                    <Text style={styles.xpGiftText}>+{m.xpGift} XP</Text>
                  </View>
                )}
                <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{m.text}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
      />

      {/* XP gift input */}
      {showXP && (
        <View style={styles.xpInputRow}>
          <Ionicons name="star" size={16} color={COLORS.xpGold} />
          <TextInput
            value={xpAmount}
            onChangeText={setXpAmount}
            placeholder="XP bedrag"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            style={styles.xpInput}
          />
          <Text style={styles.xpInputLabel}>XP</Text>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputArea}>
        <Pressable
          onPress={() => { setShowXP(!showXP); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.xpToggleBtn, showXP && styles.xpToggleBtnActive]}
        >
          <Ionicons name="star-outline" size={18} color={showXP ? COLORS.xpGold : COLORS.silver} />
        </Pressable>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Stuur een bericht..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.msgInput}
          multiline
        />
        <Pressable
          onPress={handleSend}
          disabled={!msg.trim()}
          style={[styles.sendBtn, !msg.trim() && { opacity: 0.4 }]}
        >
          <Ionicons name="send" size={18} color={COLORS.emerald} />
        </Pressable>
      </View>
    </View>
  );
}

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const { friendRequests, chats, acceptFriendRequest, declineFriendRequest } = useLumia();
  const [openChat, setOpenChat] = useState<ChatThread | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 90;

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Inbox</Text>

        {/* Friend requests */}
        {friendRequests.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Vriendverzoeken</Text>
            {friendRequests.map((req) => (
              <FriendRequestCard
                key={req.id}
                request={req}
                onAccept={() => acceptFriendRequest(req.id)}
                onDecline={() => declineFriendRequest(req.id)}
              />
            ))}
          </>
        )}

        {/* Chats */}
        <Text style={styles.sectionLabel}>Berichten</Text>
        {chats.map((chat) => (
          <ChatCard
            key={chat.id}
            chat={chat}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setOpenChat(chat);
            }}
          />
        ))}
        {chats.length === 0 && (
          <View style={styles.empty}>
            <Feather name="message-circle" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Geen berichten</Text>
          </View>
        )}
      </ScrollView>

      {/* Chat modal */}
      <Modal
        visible={!!openChat}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpenChat(null)}
      >
        {openChat && (
          <DualGlowBackground style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <ChatModal chat={openChat} onClose={() => setOpenChat(null)} />
          </DualGlowBackground>
        )}
      </Modal>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  pageTitle: {
    fontSize: 32,
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_700Bold",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  sectionLabel: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 8,
  },
  requestCard: {
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requestLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  requestAvatar: { width: 42, height: 42, position: "relative" },
  requestAvatarEmoji: { fontSize: 28 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emerald,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },
  requestName: {
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 14,
  },
  requestStats: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  requestStat: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  requestActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  declineBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,224,122,0.12)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  acceptText: { color: COLORS.emerald, fontFamily: "Outfit_600SemiBold", fontSize: 13 },
  chatCard: {
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatAvatar: { width: 44, height: 44, position: "relative" },
  chatAvatarEmoji: { fontSize: 30 },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  chatTime: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  chatLast: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", gap: 12, marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 14 },
  // Chat modal styles
  chatModal: {
    flex: 1,
    backgroundColor: "transparent",
  },
  chatModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.silverBorder,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  chatModalName: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  chatModalStatus: { color: COLORS.emerald, fontFamily: "Outfit_400Regular", fontSize: 11 },
  msgList: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  msgRow: { flexDirection: "row", justifyContent: "flex-start" },
  msgRowMe: { justifyContent: "flex-end" },
  msgBubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  msgBubbleThem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: COLORS.silverBorder,
    borderBottomLeftRadius: 4,
  },
  msgBubbleMe: {
    backgroundColor: "rgba(0,224,122,0.12)",
    borderColor: COLORS.emeraldBorder,
    borderBottomRightRadius: 4,
  },
  xpGiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,215,0,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    alignSelf: "flex-start",
  },
  xpGiftText: { color: COLORS.xpGold, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12 },
  msgText: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 14, lineHeight: 20 },
  msgTextMe: { color: COLORS.textPrimary },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.silverBorder,
  },
  xpInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,215,0,0.15)",
  },
  xpInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15,
    paddingVertical: 8,
  },
  xpInputLabel: { color: COLORS.xpGold, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  xpToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(192,200,216,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
  },
  xpToggleBtnActive: {
    backgroundColor: "rgba(255,215,0,0.08)",
    borderColor: "rgba(255,215,0,0.3)",
  },
  msgInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.silverBorder,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,224,122,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
});
