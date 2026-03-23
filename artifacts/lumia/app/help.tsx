import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
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

const FAQ = [
  {
    q: "Wat is EchoMatch?",
    a: "EchoMatch is een Elite Trust Platform waar jouw betrouwbaarheid wordt gemeten via 4 Trust Meters: Honor, Reflectie, Vitality en Decay. Samen vormen ze jouw persoonlijke Trust Score.",
  },
  {
    q: "Hoe verdien ik XP?",
    a: "XP verdien je door eerlijke reacties te geven, stellingen te plaatsen en stemmen, je tuin te verzorgen, XP te ontvangen van vrienden en andere positieve sociale acties.",
  },
  {
    q: "Wat is Trust-Gravity?",
    a: "Trust-Gravity zorgt ervoor dat stemmen van gebruikers met een hogere Honor score meer gewicht hebben. Hoe hoger jouw Honor, hoe zwaarder jouw stem telt op stellingen.",
  },
  {
    q: "Hoe werkt de Levende Tuin?",
    a: "Je Levende Tuin is een visuele weerspiegeling van jouw Vitality score. Door de tuin water te geven, te voeden en te verzorgen, groeit jouw Vitality en verdien je XP.",
  },
  {
    q: "Kan ik anoniem stemmen?",
    a: "Ja, je kunt stellingen anoniem plaatsen. Je Trust-Gravity gewicht blijft dan wel actief, maar jouw naam wordt niet getoond aan andere gebruikers.",
  },
  {
    q: "Hoe verstuur ik een XP Gift?",
    a: "Open een chat met een vriend, druk op het gift-icoon en kies een hoeveelheid: 5, 10, 25 of 50 XP. Het XP wordt direct overgemaakt en jouw Honor stijgt door de vrijgevigheid.",
  },
  {
    q: "Wat is het Decay-meter?",
    a: "Decay meet negatieve patronen in jouw gedrag. Door consistent positief te handelen daalt de Decay score. Een hoge Decay vermindert tijdelijk jouw Trust Score.",
  },
  {
    q: "Hoe verwijder ik mijn account?",
    a: "Ga naar Instellingen > Account verwijderen. Alle data wordt permanent verwijderd. Dit is onomkeerbaar.",
  },
];

const GUIDELINES = [
  "Behandel anderen met respect en waardigheid",
  "Wees eerlijk in je stemmen en reacties",
  "Gebruik geen beledigend of discriminerend taalgebruik",
  "Deel geen persoonlijke informatie van anderen",
  "Misbruik van het XP-systeem is niet toegestaan",
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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
            <Ionicons name="help-circle" size={22} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.sub}>Veelgestelde vragen & contact</Text>
          </View>
        </View>

        {/* Contact support */}
        <GlassPanel style={[styles.contactCard, { borderColor: PURPLE_BORDER }]}>
          <Ionicons name="mail" size={22} color={PURPLE} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Neem contact op</Text>
            <Text style={styles.contactSub}>Ons team reageert binnen 24 uur</Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL("mailto:support@echomatch.nl?subject=Support%20aanvraag")}
            style={styles.contactBtn}
          >
            <Text style={styles.contactBtnText}>Stuur bericht</Text>
          </Pressable>
        </GlassPanel>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Veelgestelde vragen</Text>
        <GlassPanel style={styles.faqCard}>
          {FAQ.map((item, i) => (
            <View key={i} style={[styles.faqItem, i > 0 && styles.faqBorder]}>
              <Pressable
                onPress={() => setOpenFAQ(openFAQ === i ? null : i)}
                style={styles.faqRow}
              >
                <Text style={styles.faqQ} numberOfLines={openFAQ === i ? undefined : 2}>
                  {item.q}
                </Text>
                <Ionicons
                  name={openFAQ === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={COLORS.textMuted}
                />
              </Pressable>
              {openFAQ === i && (
                <Text style={styles.faqA}>{item.a}</Text>
              )}
            </View>
          ))}
        </GlassPanel>

        {/* Community guidelines */}
        <Text style={styles.sectionTitle}>Community Richtlijnen</Text>
        <GlassPanel style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <Ionicons name="shield-checkmark" size={18} color={PURPLE} />
            <Text style={styles.guidelinesTitle}>Gedragscode EchoMatch</Text>
          </View>
          {GUIDELINES.map((g, i) => (
            <View key={i} style={styles.guidelineRow}>
              <Feather name="check-circle" size={13} color={PURPLE} />
              <Text style={styles.guidelineText}>{g}</Text>
            </View>
          ))}
          <Text style={styles.guidelinesFooter}>
            Overtreding van deze richtlijnen kan leiden tot een tijdelijke verlaging van jouw Trust Score of een accountschorsing.
          </Text>
        </GlassPanel>

        {/* Links */}
        <GlassPanel style={styles.linksCard}>
          {[
            { label: "Privacybeleid", onPress: () => router.push("/privacy") },
            { label: "Algemene Voorwaarden", onPress: () => router.push("/terms") },
            { label: "Over EchoMatch", onPress: () => router.push("/about") },
          ].map((link, i) => (
            <Pressable
              key={i}
              onPress={link.onPress}
              style={({ pressed }) => [styles.linkRow, i > 0 && styles.linkBorder, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.linkText}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </GlassPanel>
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
  contactCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  contactTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  contactSub: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 12, marginTop: 2 },
  contactBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: PURPLE_BG, borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  contactBtnText: { color: PURPLE, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 12 },
  faqCard: { overflow: "hidden", marginBottom: 20 },
  faqItem: { paddingHorizontal: 14, paddingVertical: 12 },
  faqBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  faqRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  faqQ: { flex: 1, color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13 },
  faqA: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 20, marginTop: 8 },
  guidelinesCard: { padding: 14, marginBottom: 20 },
  guidelinesHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  guidelinesTitle: { color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
  guidelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  guidelineText: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 20 },
  guidelinesFooter: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 11, lineHeight: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 10 },
  linksCard: { overflow: "hidden", marginBottom: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  linkText: { color: COLORS.textSecondary, fontFamily: "Outfit_500Medium", fontSize: 14 },
});
