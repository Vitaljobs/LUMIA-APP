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

const ARTICLES = [
  {
    nr: "1",
    title: "Gebruik van de App",
    body: `Lumia is een platform voor het meten en verbeteren van vertrouwen in sociale netwerken. Door gebruik te maken van de app ga je akkoord met deze voorwaarden.

Je dient minimaal 16 jaar oud te zijn om gebruik te maken van Lumia. Gebruik van de app is strikt persoonlijk en niet overdraagbaar. Het is niet toegestaan de app te gebruiken voor commerciële doeleinden zonder schriftelijke toestemming.`,
  },
  {
    nr: "2",
    title: "Account & Verantwoordelijkheid",
    body: `Je bent verantwoordelijk voor alle activiteiten die plaatsvinden onder jouw account. Het is verboden om:

• Valse of misleidende profielinformatie te verstrekken
• Meerdere accounts aan te maken om het systeem te manipuleren
• Automatische tools of bots te gebruiken om XP te verzamelen
• Toegang te verkrijgen tot accounts van andere gebruikers

Bij overtreding behoudt Lumia het recht jouw account te schorsen of permanent te verwijderen.`,
  },
  {
    nr: "3",
    title: "Gedragsregels",
    body: `Lumia streeft naar een respectvolle gemeenschap. Het is verboden:

• Beledigend, discriminerend of haatdragend gedrag te vertonen
• Andere gebruikers te intimideren of te stalken
• Spam of ongewenste communicatie te versturen
• Desinformatie te verspreiden via stellingen of berichten
• Het Trust-systeem bewust te manipuleren of te misbruiken

Overtredingen worden gesanctioneerd via verlaging van de Trust Score, tijdelijke schorsing of permanente verwijdering.`,
  },
  {
    nr: "4",
    title: "XP-systeem & Trust Meters",
    body: `Het XP-systeem en de Trust Meters zijn bedoeld als gamificatie-element ter bevordering van eerlijk gedrag. Lumia behoudt het recht om:

• De berekening van Trust Scores en XP-waarden aan te passen
• XP te corrigeren of in te trekken bij geconstateerd misbruik
• Het Trust-Gravity systeem te kalibreren voor platformbalans

XP en Trust Meters hebben geen monetaire waarde en zijn niet verhandelbaar of overdraagbaar.`,
  },
  {
    nr: "5",
    title: "Plus-abonnement",
    body: `Lumia biedt een optioneel Plus-abonnement met uitgebreide functies. Voor het Plus-abonnement gelden aanvullende voorwaarden:

• Betaling via de App Store of Google Play
• Automatische verlenging tenzij opgezegd vóór het einde van de periode
• Geen restitutie voor reeds betaalde abonnementsperiodes
• Bij verwijdering van het account vervalt het Plus-abonnement zonder restitutie

Prijzen zijn inclusief BTW en kunnen jaarlijks worden aangepast.`,
  },
  {
    nr: "6",
    title: "Intellectueel Eigendom",
    body: `Alle content op het Lumia-platform, inclusief het Trust-systeem, design en technologie, is eigendom van Lumia. Het is verboden om:

• Content te kopiëren, reproduceren of distribueren zonder toestemming
• De broncode van de app te reverse-engineeren
• Merknamen, logo's of interface-elementen te gebruiken

Door content te plaatsen op Lumia verleen je ons een niet-exclusieve licentie om deze content te tonen op het platform.`,
  },
  {
    nr: "7",
    title: "Aansprakelijkheid & Disclaimer",
    body: `Lumia is niet aansprakelijk voor:

• Schade als gevolg van gebruik of niet-gebruik van de app
• Verlies van XP of Trust Score data door technische storingen
• Acties van andere gebruikers op het platform
• Tijdelijke onbeschikbaarheid van de service

De app wordt aangeboden "as is". Lumia garandeert geen ononderbroken beschikbaarheid.`,
  },
  {
    nr: "8",
    title: "Wijzigingen & Toepasselijk Recht",
    body: `Lumia behoudt het recht deze voorwaarden te wijzigen. Wijzigingen worden 30 dagen van tevoren aangekondigd via de app.

Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam.

Versie: januari 2026 | Lumia B.V. | Amsterdam, Nederland`,
  },
];

export default function TermsScreen() {
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
            <Ionicons name="document-text" size={22} color={PURPLE} />
          </View>
          <View>
            <Text style={styles.title}>Algemene Voorwaarden</Text>
            <Text style={styles.sub}>Lumia · Januari 2026</Text>
          </View>
        </View>

        {/* Intro banner */}
        <GlassPanel style={[styles.introBanner, { borderColor: PURPLE_BORDER }]}>
          <Ionicons name="information-circle" size={18} color={PURPLE} />
          <Text style={styles.introText}>
            Door Lumia te gebruiken ga je akkoord met deze algemene voorwaarden. Lees ze zorgvuldig door.
          </Text>
        </GlassPanel>

        {/* Articles */}
        {ARTICLES.map((article) => (
          <GlassPanel key={article.nr} style={styles.article}>
            <View style={styles.articleHeader}>
              <View style={styles.articleNrWrap}>
                <Text style={styles.articleNr}>{article.nr}</Text>
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
            </View>
            <Text style={styles.articleBody}>{article.body}</Text>
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
  article: { padding: 14 },
  articleHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  articleNrWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: PURPLE_BG, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: PURPLE_BORDER,
  },
  articleNr: { color: PURPLE, fontFamily: "SpaceGrotesk_700Bold", fontSize: 13 },
  articleTitle: { flex: 1, color: COLORS.textPrimary, fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
  articleBody: { color: COLORS.textMuted, fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 22 },
});
