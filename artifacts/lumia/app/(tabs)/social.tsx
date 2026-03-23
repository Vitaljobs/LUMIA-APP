import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { DualGlowBackground } from "@/components/DualGlowBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { useLumia } from "@/context/LumiaContext";
import { Statement } from "@/context/LumiaContext";

function TrustGravityBadge({ weight, visible }: { weight: number; visible: boolean }) {
  if (!visible) return null;
  const pct = Math.round(weight * 100);
  const color = pct >= 70 ? COLORS.emerald : pct >= 40 ? COLORS.xpGold : COLORS.decay;
  return (
    <View style={[trustStyles.badge, { borderColor: color + "40", backgroundColor: color + "12" }]}>
      <Ionicons name="shield-checkmark" size={11} color={color} />
      <Text style={[trustStyles.label, { color }]}>Trust-Gravity {weight.toFixed(2)}x</Text>
    </View>
  );
}

const trustStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  label: { fontFamily: "Outfit_500Medium", fontSize: 11 },
});

function StatementCard({ statement }: { statement: Statement }) {
  const { voteOnStatement, getTrustGravityWeight, user } = useLumia();
  const [hovering, setHovering] = useState(false);
  const totalVotes = statement.votes.reduce((a, b) => a + b, 0);
  const myWeight = getTrustGravityWeight(user.id);
  const hasVoted = statement.myVote !== undefined;

  return (
    <GlassPanel style={styles.statementCard}>
      {/* Author row */}
      <View style={styles.statementHeader}>
        <View style={styles.authorRow}>
          <View style={styles.anonAvatar}>
            <Ionicons
              name={statement.anonymous ? "eye-off-outline" : "person-outline"}
              size={12}
              color={COLORS.silver}
            />
          </View>
          <Text style={styles.authorName}>{statement.author}</Text>
          {statement.anonymous && (
            <View style={styles.anonBadge}>
              <Text style={styles.anonText}>Anoniem</Text>
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>
          {Math.floor((Date.now() - statement.timestamp) / 3600000)}u geleden
        </Text>
      </View>

      {/* Statement text */}
      <Text style={styles.statementText}>{statement.text}</Text>

      {/* Trust-Gravity indicator — shown when not yet voted */}
      {!hasVoted && (
        <TrustGravityBadge weight={myWeight} visible />
      )}

      {/* Vote options */}
      <View style={styles.optionsCol}>
        {statement.options.map((opt, idx) => {
          const votes = statement.votes[idx];
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = statement.myVote === idx;

          return (
            <Pressable
              key={idx}
              onPress={() => {
                if (!hasVoted) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  voteOnStatement(statement.id, idx);
                }
              }}
              onHoverIn={() => setHovering(true)}
              onHoverOut={() => setHovering(false)}
              style={({ pressed }) => [
                styles.optionBtn,
                isSelected && styles.optionSelected,
                pressed && !hasVoted && { opacity: 0.8 },
              ]}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.emerald} style={{ marginRight: 6 }} />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && { color: COLORS.emerald },
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
                {hasVoted && (
                  <Text style={styles.optionPct}>{pct}%</Text>
                )}
              </View>
              {hasVoted && (
                <View style={styles.optionBarTrack}>
                  <View
                    style={[
                      styles.optionBarFill,
                      {
                        width: `${pct}%` as any,
                        backgroundColor: isSelected ? COLORS.emerald : "rgba(192,200,216,0.3)",
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.statementFooter}>
        <Ionicons name="stats-chart-outline" size={12} color={COLORS.textMuted} />
        <Text style={styles.voteCount}>{totalVotes} stemmen</Text>
        {hasVoted && (
          <>
            <Text style={styles.footerDot}>·</Text>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.emerald} />
            <Text style={styles.footerTrust}>{myWeight.toFixed(2)}x gewicht</Text>
          </>
        )}
      </View>
    </GlassPanel>
  );
}

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { statements } = useLumia();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 90;

  return (
    <DualGlowBackground style={{ flex: 1 }}>
      <FlatList
        data={statements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StatementCard statement={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Social</Text>
              <Text style={styles.pageSubtitle}>Stellingen & Stemmen</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/statement/create");
              }}
              style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }]}
            >
              <Feather name="plus" size={20} color={COLORS.emerald} />
            </Pressable>
          </View>
        }
      />
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16 },
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
  pageSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,224,122,0.12)",
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  statementCard: { padding: 16, marginBottom: 12 },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  anonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(192,200,216,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: { color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 13 },
  anonBadge: {
    backgroundColor: "rgba(168,85,247,0.12)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.25)",
  },
  anonText: { color: COLORS.shame, fontSize: 10, fontFamily: "Outfit_500Medium" },
  timestamp: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  statementText: {
    color: COLORS.textPrimary,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  optionsCol: { gap: 8, marginBottom: 12 },
  optionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  optionSelected: {
    borderColor: COLORS.emeraldBorder,
    backgroundColor: "rgba(0,224,122,0.07)",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  optionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  optionText: { color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, flex: 1 },
  optionPct: { color: COLORS.textMuted, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12 },
  optionBarTrack: { height: 3, backgroundColor: "rgba(255,255,255,0.06)" },
  optionBarFill: { height: "100%" as any, borderRadius: 2 },
  statementFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  voteCount: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11 },
  footerDot: { color: COLORS.textMuted, fontSize: 11 },
  footerTrust: { color: COLORS.emerald, fontFamily: "Outfit_500Medium", fontSize: 11 },
});
