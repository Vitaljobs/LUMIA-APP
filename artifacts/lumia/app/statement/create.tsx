import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";

export default function CreateStatementScreen() {
  const insets = useSafeAreaInsets();
  const { addStatement, user } = useLumia();
  const [text, setText] = useState("");
  const [options, setOptions] = useState<[string, string, string]>(["Mee eens", "Neutraal", "Oneens"]);
  const [anonymous, setAnonymous] = useState(false);
  const [link, setLink] = useState("");

  const canSubmit = text.trim().length > 10 && options.every((o) => o.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addStatement({
      text: text.trim(),
      options,
      author: anonymous ? "Anoniem" : user.name,
      authorId: user.id,
      anonymous,
      link: link.trim() || undefined,
    });
    router.back();
  };

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.silver} />
            </Pressable>
            <Text style={styles.title}>Nieuwe Stelling</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
            >
              <Text style={styles.submitText}>Plaatsen</Text>
            </Pressable>
          </View>

          {/* Statement text */}
          <GlassPanel style={styles.inputCard}>
            <Text style={styles.inputLabel}>Stelling</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Schrijf hier je stelling..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.textInput}
              multiline
              maxLength={280}
            />
            <Text style={styles.charCount}>{text.length}/280</Text>
          </GlassPanel>

          {/* Answer options */}
          <Text style={styles.sectionLabel}>Keuze-opties (3)</Text>
          <GlassPanel style={styles.optionsCard}>
            {options.map((opt, idx) => (
              <View key={idx} style={[styles.optionRow, idx > 0 && styles.optionRowBorder]}>
                <View
                  style={[
                    styles.optionNum,
                    { backgroundColor: idx === 0 ? COLORS.emerald + "20" : idx === 1 ? COLORS.silver + "15" : COLORS.decay + "15" },
                  ]}
                >
                  <Text style={[styles.optionNumText, {
                    color: idx === 0 ? COLORS.emerald : idx === 1 ? COLORS.silver : COLORS.decay
                  }]}>{idx + 1}</Text>
                </View>
                <TextInput
                  value={opt}
                  onChangeText={(t) => {
                    const newOpts = [...options] as [string, string, string];
                    newOpts[idx] = t;
                    setOptions(newOpts);
                  }}
                  placeholder={`Optie ${idx + 1}`}
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.optionInput}
                  maxLength={60}
                />
              </View>
            ))}
          </GlassPanel>

          {/* Optional link */}
          <Text style={styles.sectionLabel}>Optionele link</Text>
          <GlassPanel style={styles.linkCard}>
            <Feather name="link" size={16} color={COLORS.textMuted} />
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.linkInput}
              keyboardType="url"
              autoCapitalize="none"
            />
          </GlassPanel>

          {/* Anonymous toggle */}
          <GlassPanel style={styles.anonCard}>
            <View style={styles.anonRow}>
              <View style={styles.anonLeft}>
                <Ionicons name="eye-off-outline" size={18} color={COLORS.shame} />
                <View>
                  <Text style={styles.anonTitle}>Anoniem plaatsen</Text>
                  <Text style={styles.anonSub}>Je naam wordt verborgen voor anderen</Text>
                </View>
              </View>
              <Switch
                value={anonymous}
                onValueChange={(v) => {
                  setAnonymous(v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: COLORS.silverBorder, true: COLORS.shame + "60" }}
                thumbColor={anonymous ? COLORS.shame : COLORS.silver}
              />
            </View>
          </GlassPanel>

          {/* XP reward note */}
          <GlassPanel variant="emerald" style={styles.xpNote}>
            <Ionicons name="star-outline" size={16} color={COLORS.xpGold} />
            <Text style={styles.xpNoteText}>
              Je verdient <Text style={{ color: COLORS.xpGold, fontFamily: "SpaceGrotesk_700Bold" }}>+10 XP</Text> voor het plaatsen van een stelling.
            </Text>
          </GlassPanel>
        </ScrollView>
      </KeyboardAvoidingView>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,224,122,0.15)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },
  submitText: { color: COLORS.emerald, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  inputCard: { padding: 16, marginBottom: 16 },
  inputLabel: {
    color: COLORS.textMuted,
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  textInput: {
    color: COLORS.textPrimary,
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, textAlign: "right", marginTop: 8 },
  sectionLabel: {
    color: COLORS.silver,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  optionsCard: { marginBottom: 16, overflow: "hidden" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  optionRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  optionNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionNumText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13 },
  optionInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  linkCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  linkInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  anonCard: { padding: 16, marginBottom: 16 },
  anonRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  anonLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  anonTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  anonSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, marginTop: 1 },
  xpNote: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  xpNoteText: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, flex: 1 },
});
