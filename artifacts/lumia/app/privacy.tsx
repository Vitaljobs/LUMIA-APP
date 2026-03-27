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

const SECTIONS = [
  {
    icon: "shield-checkmark-outline",
    title: "Welke gegevens verzamelen wij?",
    body: `Lumia verzamelt de volgende categorieën persoonsgegevens:

• Profielinformatie: gebruikersnaam, avatar en niveau
• Trust Meter scores: Honor, Reflectie, Vitality en Decay
• Activiteitsdata: XP-log, stemgedrag op stellingen, tuinacties
• Communicatiedata: berichten in chats (inclusief XP-gifts)
• Systeemgegevens: apparaattype, app-versie, tijdstempels

Wij verzamelen géén gevoelige persoonsgegevens zoals locatiedata, telefoonnummer of betaalgegevens buiten de Plus-abonnementsstroom.`,
  },
  {
    icon: "analytics-outline",
    title: "Hoe gebruiken wij jouw gegevens?",
    body: `Jouw gegevens worden gebruikt voor de volgende doeleinden:

• Het berekenen en weergeven van jouw Trust Score
• Het personaliseren van jouw ervaring in de app
• Het faciliteren van sociale interacties met vrienden
• Het verbeteren van de platform-functionaliteit
• Het detecteren van misbruik en handhaven van de gedragscode

Wij verkopen jouw gegevens nooit aan derden. Gegevens worden niet gebruikt voor gerichte advertenties.`,
  },
  {
    icon: "eye-off-outline",
    title: "Anonimiteit & Privacy",
    body: `Lumia biedt de volgende anonimiteitsfuncties:

• Anonieme stellingen: je kunt stellingen plaatsen zonder dat jouw naam zichtbaar is voor andere gebruikers
• Trust-Gravity blijft actief bij anonieme deelname
• Jouw Decay-score is alleen zichtbaar voor jouzelf
• Chatgesprekken zijn end-to-end versleuteld en niet toegankelijk voor derden

Je Trust Score is altijd zichtbaar voor andere gebruikers als onderdeel van het platform.`,
  },
  {
    icon: "cloud-outline",
    title: "Dataopslag & Beveiliging",
    body: `Al jouw gegevens worden opgeslagen in beveiligde Europese datacenters (EU). Wij hanteren de volgende beveiligingsmaatregelen:

• Row Level Security (RLS) op databaseniveau
• Project-isolatie via unieke project-ID's
• HTTPS-encryptie voor alle dataoverdracht
• Toegang beperkt tot geautoriseerde serverprocessen

Gegevens worden bewaard zolang jouw account actief is, plus maximaal 30 dagen na verwijdering voor back-updoeleinden.`,
  },
  {
    icon: "person-remove-outline",
    title: "Account verwijderen",
    body: `Je hebt te allen tijde het recht om jouw account en alle bijbehorende gegevens te laten verwijderen.

Via Instellingen > Account verwijderen wordt een verwijderingsverzoek ingediend. Binnen 72 uur worden alle persoonsgegevens permanent verwijderd uit onze systemen, inclusief:

• Profielinformatie en Trust Meters
• XP-log en activiteitsdata
• Chatgeschiedenis en stellingen
• Alle notificaties en vriendschapsverbindingen

Na verwijdering is herstel niet mogelijk.`,
  },
  {
    icon: "mail-outline",
    title: "Contact & AVG-rechten",
    body: `Op grond van de Algemene Verordening Gegevensbescherming (AVG) heb je het recht op inzage, rectificatie en verwijdering van jouw persoonsgegevens.

Voor vragen over jouw privacy of het uitoefenen van jouw rechten:
privacy@lumia.nl

Lumia is geregistreerd bij de Autoriteit Persoonsgegevens (AP).

Laatst bijgewerkt: januari 2026`,
  },
];

export default function PrivacyScreen() {
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
            <Ionicons name="shield-checkmark" size={22} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.title}>Privacybeleid</Text>
            <Text style={styles.sub}>Lumia · Versie januari 2026</Text>
          </View>
        </View>

        {/* Intro banner */}
        <GlassPanel style={[styles.introBanner, { borderColor: PURPLE_BORDER }]}>
          <Ionicons name="lock-closed" size={18} color={PURPLE} />
          <Text style={styles.introText}>
            Lumia neemt jouw privacy serieus. Wij verwerken zo min mogelijk gegevens en alleen voor de doeleinden beschreven in dit beleid.
          </Text>
        </GlassPanel>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <GlassPanel key={i} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name={section.icon as any} size={16} color={PURPLE} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </GlassPanel>
        ))}
      </ScrollView>
    </DualGlowBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
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
  introBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14,
    borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  introText: { flex: 1, color: COLORS.textSecondary, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 20 },
  section: { padding: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: PURPLE_BG, alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { flex: 1, color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
  sectionBody: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 22 },
});
