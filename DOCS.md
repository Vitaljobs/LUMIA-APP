# Lumia 2026 — Volledige Projectdocumentatie

> Elite Trust Platform | Expo React Native + Node.js + PostgreSQL

---

## Inhoudsopgave

1. [Projectoverzicht](#1-projectoverzicht)
2. [Architectuur](#2-architectuur)
3. [Projectstructuur](#3-projectstructuur)
4. [Database](#4-database)
5. [API Server](#5-api-server)
6. [Mobiele App — Schermen](#6-mobiele-app--schermen)
7. [Componenten](#7-componenten)
8. [State Management (Context)](#8-state-management-context)
9. [Design Systeem](#9-design-systeem)
10. [Configuratie & Secrets](#10-configuratie--secrets)
11. [App Store Voorbereiding](#11-app-store-voorbereiding)
12. [Lokaal Starten](#12-lokaal-starten)
13. [GitHub](#13-github)

---

## 1. Projectoverzicht

**Lumia** (intern: Lumia 2026) is een Elite Trust Platform waarbij gebruikers hun betrouwbaarheid en integriteit meetbaar maken via vier Trust Meters. De kern van het platform is het **Trust-Gravity** algoritme: hoe hoger jouw Honor score, hoe zwaarder jouw stem telt bij communitystemming.

### Kernconcepten

| Concept | Uitleg |
|---|---|
| **Trust Meters** | 4 dimensies die samen de Trust Score vormen |
| **Honor** | Eerlijkheid en integriteit — basis van Trust-Gravity |
| **Reflectie** | Zelfbewustzijn en persoonlijke groei |
| **Vitality** | Energie, betrokkenheid en activiteit |
| **Decay** | Afname bij inactiviteit of negatief gedrag |
| **XP** | Ervaringspunten die meters beïnvloeden |
| **Trust-Gravity** | Stemgewicht = Honor / 100 |
| **Living Garden** | Visuele tuin die Vitality weerspiegelt |
| **Stellingen** | Community-vragen met gewogen stemmen |
| **XP Gifting** | XP sturen naar vrienden in chat |

---

## 2. Architectuur

```
┌─────────────────────────────────────────┐
│         Lumia Monorepo (pnpm)           │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Expo App    │  │   API Server    │  │
│  │  (Mobile)    │◄─►  (Node/Express) │  │
│  │              │  │                 │  │
│  │  iOS         │  │  REST API       │  │
│  │  Android     │  │  Port: 8080     │  │
│  │  Web         │  │                 │  │
│  └──────────────┘  └────────┬────────┘  │
│                             │           │
│                    ┌────────▼────────┐  │
│                    │   Insforge DB   │  │
│                    │  (PostgreSQL)   │  │
│                    │  project_id:    │  │
│                    │  LUMIA_2026     │  │
│                    └─────────────────┘  │
└─────────────────────────────────────────┘
```

**Communicatieflow:**
1. Expo app stuurt HTTP verzoeken naar de API server (`/api/lumia/...`)
2. API server valideert en verwerkt de verzoeken
3. API server communiceert via Insforge SDK met PostgreSQL
4. Alle tabellen zijn geïsoleerd via `project_id = "LUMIA_2026"` en prefix `lumia_`

---

## 3. Projectstructuur

```
workspace/
├── artifacts/
│   ├── lumia/                    # Expo React Native app
│   │   ├── app/                  # Expo Router schermen
│   │   │   ├── _layout.tsx       # Root layout, providers, onboarding gate
│   │   │   ├── onboarding.tsx    # Onboarding flow
│   │   │   ├── (tabs)/           # Tab navigatie
│   │   │   │   ├── _layout.tsx   # Tab bar configuratie
│   │   │   │   ├── index.tsx     # Home (Trust Meters + Living Garden)
│   │   │   │   ├── social.tsx    # Sociaal (vrienden, stellingen)
│   │   │   │   ├── inbox.tsx     # Berichten (chat)
│   │   │   │   ├── notifications.tsx  # Meldingen
│   │   │   │   └── dashboard.tsx # Dashboard (XP logboek + account)
│   │   │   ├── profile/
│   │   │   │   └── [id].tsx      # Gebruikersprofiel
│   │   │   ├── statement/
│   │   │   │   └── create.tsx    # Stelling aanmaken (modal)
│   │   │   ├── transparency/
│   │   │   │   └── [meter].tsx   # Meter detail (modal)
│   │   │   ├── admin.tsx         # Admin dashboard
│   │   │   ├── settings.tsx      # Instellingen
│   │   │   ├── help.tsx          # Help & Support
│   │   │   ├── privacy.tsx       # Privacybeleid
│   │   │   ├── terms.tsx         # Algemene Voorwaarden
│   │   │   └── about.tsx         # Over Lumia
│   │   ├── components/           # Herbruikbare componenten
│   │   │   ├── DualGlowBackground.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── MeterCard.tsx
│   │   │   ├── LivingGarden.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ErrorFallback.tsx
│   │   ├── context/
│   │   │   └── LumiaContext.tsx  # Centrale state provider
│   │   ├── constants/
│   │   │   └── colors.ts         # Kleurpalet en thema
│   │   ├── assets/
│   │   │   └── images/
│   │   │       ├── icon.png      # App icoon (1024x1024)
│   │   │       └── splash-icon.png # Splash screen icoon
│   │   ├── app.json              # Expo configuratie
│   │   └── eas.json              # EAS Build profielen
│   │
│   └── api-server/               # Express API server
│       └── src/
│           ├── index.ts          # Server entry point
│           ├── routes/
│           │   └── lumia.ts      # Alle Lumia API routes
│           └── lib/
│               ├── insforge.ts   # Database client & helpers
│               └── logger.ts     # Pino logger
│
├── README.md                     # Project README met preview
├── DOCS.md                       # Dit bestand
├── preview.png                   # App screenshot
└── pnpm-workspace.yaml           # Monorepo configuratie
```

---

## 4. Database

### Verbinding

- **Provider:** Insforge (Supabase-compatible PostgreSQL)
- **Project ID:** `LUMIA_2026`
- **Tabel prefix:** `lumia_`
- **Isolatie:** Alle queries worden gefilterd op `project_id`

### Tabellen

#### `lumia_meters`
Slaat de 4 Trust Meter waarden op per gebruiker.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `user_id` | text | Gebruikers-ID |
| `project_id` | text | `LUMIA_2026` |
| `honor` | integer | 0–100, eerlijkheid |
| `reflectie` | integer | 0–100, zelfbewustzijn |
| `vitality` | integer | 0–100, energie |
| `decay` | integer | 0–100, risico |
| `xp` | integer | Totaal XP punten |
| `created_at` | timestamp | Aanmaakdatum |
| `updated_at` | timestamp | Laatste update |

#### `lumia_statements`
Community stellingen/vragen voor stemming.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `author_id` | text | Auteur gebruikers-ID |
| `text` | text | De stelling |
| `option_0` | text | Antwoordoptie 1 |
| `option_1` | text | Antwoordoptie 2 |
| `option_2` | text | Antwoordoptie 3 (optioneel) |
| `votes_0` | float | Gewogen stemmen op optie 1 |
| `votes_1` | float | Gewogen stemmen op optie 2 |
| `votes_2` | float | Gewogen stemmen op optie 3 |
| `is_anonymous` | boolean | Anoniem geplaatst |
| `created_at` | timestamp | Aanmaakdatum |

#### `lumia_statement_votes`
Bijhoudt wie op wat heeft gestemd (voorkomt dubbel stemmen).

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `statement_id` | uuid | Verwijzing naar stelling |
| `user_id` | text | Stemmer |
| `option_index` | integer | Gekozen optie (0, 1 of 2) |
| `weight` | float | Trust-Gravity gewicht |
| `created_at` | timestamp | Stemdatum |

#### `lumia_xp_log`
Volledige audittrail van alle XP mutaties.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `user_id` | text | Gebruiker |
| `action` | text | Beschrijving van de actie |
| `xp` | integer | XP verandering (+/-) |
| `category` | text | `garden`, `social`, `gift`, etc. |
| `created_at` | timestamp | Tijdstip |

#### `lumia_notifications`
Meldingen per gebruiker.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `user_id` | text | Ontvanger |
| `type` | text | `xp_gift`, `friend_request`, `system`, etc. |
| `title` | text | Titel van de melding |
| `body` | text | Inhoud |
| `read` | boolean | Gelezen status |
| `created_at` | timestamp | Tijdstip |

#### `lumia_friends`
Vriendschapsverbindingen.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `user_id` | text | Gebruiker |
| `friend_id` | text | Vriend |
| `created_at` | timestamp | Vrienddatum |

#### `lumia_friend_requests`
Openstaande vriendschapsverzoeken.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `from_id` | text | Verzoek van |
| `to_id` | text | Verzoek naar |
| `status` | text | `pending`, `accepted`, `declined` |
| `created_at` | timestamp | Tijdstip |

#### `lumia_messages`
Chatberichten tussen gebruikers.

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid | Primaire sleutel |
| `project_id` | text | `LUMIA_2026` |
| `chat_id` | text | Unieke chat-ID (user1_user2) |
| `sender_id` | text | Afzender |
| `text` | text | Berichtinhoud |
| `xp_gift` | integer | Bijgevoegd XP bedrag (optioneel) |
| `created_at` | timestamp | Tijdstip |

---

## 5. API Server

**Base URL (dev):** `http://localhost:8080`  
**Alle Lumia routes:** `/api/lumia/...`

### Health

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/healthz` | Server statuscheck |
| `GET` | `/api/lumia/setup/status` | Database tabelstatus |

### Meters

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/meters/:userId` | Haal Trust Meters op |
| `POST` | `/api/lumia/meters/:userId/upsert` | Aanmaken of bijwerken |

**Upsert body:**
```json
{
  "honor": 76,
  "reflectie": 13,
  "vitality": 91,
  "decay": 3,
  "xp": 1240
}
```

### Stellingen

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/statements` | Alle stellingen ophalen |
| `POST` | `/api/lumia/statements` | Nieuwe stelling plaatsen |
| `POST` | `/api/lumia/statements/:id/vote` | Stemmen op een stelling |

**Stelling aanmaken body:**
```json
{
  "author_id": "user_123",
  "text": "Is eerlijkheid altijd de beste keuze?",
  "option_0": "Ja, altijd",
  "option_1": "Nee, soms niet",
  "option_2": "Hangt ervan af",
  "is_anonymous": false
}
```

**Stemmen body:**
```json
{
  "user_id": "user_123",
  "option_index": 0,
  "weight": 0.76
}
```

### XP Logboek

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/xp-log/:userId` | XP geschiedenis ophalen |
| `POST` | `/api/lumia/xp-log/:userId` | XP actie vastleggen |

**XP log body:**
```json
{
  "action": "Tuin water gegeven",
  "xp": 10,
  "category": "garden"
}
```

### Notificaties

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/notifications/:userId` | Meldingen ophalen |
| `POST` | `/api/lumia/notifications/:userId` | Melding aanmaken |
| `PATCH` | `/api/lumia/notifications/:userId/:notifId/read` | Markeer als gelezen |

### Sociaal

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/friends/:userId` | Vrienden ophalen |
| `POST` | `/api/lumia/friends/:userId` | Vriend toevoegen |

### Berichten

| Methode | Route | Omschrijving |
|---|---|---|
| `GET` | `/api/lumia/messages/:chatId` | Chat ophalen |
| `POST` | `/api/lumia/messages` | Bericht sturen |

**Bericht body:**
```json
{
  "chat_id": "user1_user2",
  "sender_id": "user_123",
  "text": "Hey!",
  "xp_gift": 10
}
```

---

## 6. Mobiele App — Schermen

### Tab Schermen

#### `(tabs)/index.tsx` — Home
- Toont de 4 Trust Meters (Honor, Reflectie, Vitality, Decay) als animerende kaarten
- Living Garden met tuinacties (Water, Feed, Prune, Pet)
- Elke tuinactie geeft XP en beïnvloedt Vitality

#### `(tabs)/social.tsx` — Sociaal
- Overzicht van vrienden met hun Trust Scores
- Community stellingen met Trust-Gravity stemmen
- Weergave van stemgewichten per optie
- Knop om nieuwe stelling aan te maken

#### `(tabs)/inbox.tsx` — Inbox
- Chatlijst met alle actieve gesprekken
- XP Gifting: stuur 5, 10, 25 of 50 XP mee met een bericht

#### `(tabs)/notifications.tsx` — Meldingen
- Activiteitsmeldingen (XP ontvangen, vriendverzoeken, systeem)
- Ongelezen teller in de tab bar
- Markeer individueel of alles als gelezen

#### `(tabs)/dashboard.tsx` — Dashboard
- XP Logboek: complete geschiedenis van XP mutaties per categorie
- Mijn Account menu met links naar info-schermen
- Admin-knop (alleen zichtbaar voor `LUMIA_ADMIN_001`)

### Stack/Modal Schermen

#### `onboarding.tsx`
- Meerdere stappen die de gebruiker introduceren aan Lumia
- Eenmalig getoond bij eerste gebruik (geslagen via AsyncStorage: `lumia_onboarding_done`)
- Blokkeert alle andere routes totdat voltooid

#### `profile/[id].tsx`
- Gedetailleerd profiel van een andere gebruiker
- Toont meters, XP score en Trust-Gravity gewicht

#### `statement/create.tsx`
- Modal voor het aanmaken van een nieuwe stelling
- Invoer: tekst, 2-3 antwoordopties, anoniem toggle

#### `transparency/[meter].tsx`
- Modal met uitleg over een specifieke meter (Honor, Reflectie, Vitality of Decay)
- Toont hoe de meter werkt, waarvoor XP verdiend wordt

#### `admin.tsx`
- Alleen toegankelijk voor gebruiker `LUMIA_ADMIN_001`
- Database tabelstatus en row counts
- Directe meter beheer

#### Info Schermen
| Scherm | Route | Inhoud |
|---|---|---|
| Instellingen | `/settings` | Notificaties, account, taal |
| Help & Support | `/help` | FAQ, gedragscode, contact |
| Privacybeleid | `/privacy` | AVG, dataverwerking |
| Voorwaarden | `/terms` | Gebruiksregels, aansprakelijkheid |
| Over Lumia | `/about` | Versie, missie, team, features |

---

## 7. Componenten

### `DualGlowBackground`
Achtergrondcomponent met twee paarse glow-effecten die subtiel animeren. Gebruikt op elk scherm als basis.

```tsx
<DualGlowBackground style={{ flex: 1 }}>
  {/* scherminhoud */}
</DualGlowBackground>
```

### `GlassPanel`
Glassmorphism container met doorzichtige achtergrond en subtiele rand. Gebruikt voor kaarten en secties.

```tsx
<GlassPanel style={{ padding: 16 }}>
  <Text>Inhoud</Text>
</GlassPanel>
```

### `MeterCard`
Animerende kaart die één Trust Meter toont met circulaire voortgangsbalk en live XP weergave.

**Props:**
- `type`: `"honor"` | `"reflectie"` | `"vitality"` | `"decay"`
- `value`: Huidige waarde (0–100)
- `onPress`: Callback bij aantikken

### `LivingGarden`
Interactieve tuin animatie die de Vitality score visualiseert. Bevat tuinacties (Water, Feed, Prune, Pet) die XP genereren en Vitality beïnvloeden.

### `ErrorBoundary` / `ErrorFallback`
React error boundary die app crashes opvangt en een herstart-knop toont.

---

## 8. State Management (Context)

### `LumiaContext` / `LumiaProvider`

De centrale state provider die de gehele app omhult. Beheert:

**State:**
- `meters` — actuele Trust Meter waarden
- `xpLog` — XP geschiedenis
- `notifications` — meldingen + ongelezen teller
- `statements` — community stellingen
- `friends` — vriendenlijst
- `messages` — chatberichten
- `currentUserId` — actieve gebruiker (default: `LUMIA_USER_001`)
- `isAdmin` — true als gebruiker `LUMIA_ADMIN_001` is

**Functies:**

| Functie | Omschrijving |
|---|---|
| `doGardenAction(type)` | Tuinactie uitvoeren, XP verdienen |
| `voteOnStatement(id, index)` | Stemmen met Trust-Gravity gewicht |
| `createStatement(data)` | Nieuwe stelling plaatsen |
| `sendMessage(chatId, text, xpGift?)` | Bericht + optioneel XP sturen |
| `markNotificationRead(id)` | Melding als gelezen markeren |
| `markAllNotificationsRead()` | Alle meldingen gelezen |
| `getTrustGravityWeight()` | Berekent stemgewicht = honor/100 |
| `refreshAll()` | Herlaad alle data van API |

**Trust-Gravity berekening:**
```typescript
getTrustGravityWeight = () => (meters.honor ?? 0) / 100;
// Voorbeeld: honor=76 → gewicht=0.76
```

**Onboarding Gate:**
```typescript
// In _layout.tsx — blokkeert app totdat onboarding klaar is
const done = await AsyncStorage.getItem("lumia_onboarding_done");
if (!done) router.replace("/onboarding");
```

---

## 9. Design Systeem

### Kleuren

| Token | Hex | Gebruik |
|---|---|---|
| `background` | `#0a0a0a` | App achtergrond |
| `purple` | `#A855F7` | Primaire accentkleur |
| `purpleBg` | `rgba(168,85,247,0.12)` | Kaart achtergronden |
| `purpleBorder` | `rgba(168,85,247,0.25)` | Randen |
| `honor` (goud) | `#F59E0B` | Honor meter |
| `reflectie` (paars) | `#A855F7` | Reflectie meter |
| `vitality` (groen) | `#10B981` | Vitality meter |
| `decay` (rood) | `#EF4444` | Decay meter |
| `textPrimary` | `#FFFFFF` | Primaire tekst |
| `textSecondary` | `#E2E8F0` | Secundaire tekst |
| `textMuted` | `#94A3B8` | Gedempte tekst |
| `silver` | `#CBD5E1` | Iconen, accenten |

### Typografie

| Lettertype | Gewicht | Gebruik |
|---|---|---|
| `SpaceGrotesk` | 700 Bold | Titels, scores |
| `SpaceGrotesk` | 600 SemiBold | Subkopjes, labels |
| `Outfit` | 500 Medium | Knoppen, nadruk |
| `Outfit` | 400 Regular | Bodytekst, beschrijvingen |

### Design Principes
- **Glassmorphism:** Doorzichtige panelen met `backdrop-filter: blur`
- **Dual Glow Aurora:** Twee animerende paarse glows op de achtergrond
- **Donker thema:** Altijd `#0a0a0a` achtergrond, nooit wit
- **Web insets:** 67px top, 34px bottom (alleen op web platform)
- **Animaties:** `useNativeDriver: false` op web (geen ondersteuning)

---

## 10. Configuratie & Secrets

### Vereiste Environment Variables

| Secret | Omschrijving |
|---|---|
| `INSFORGE_API_KEY` | API sleutel voor Insforge database |
| `INSFORGE_URL` | Basis-URL van de Insforge instantie |
| `SESSION_SECRET` | Express sessie beveiliging |
| `GITHUB_TOKEN` | GitHub Classic token voor code pushes |

> ⚠️ Secrets worden beheerd via **Replit Secrets** — nooit hard-coden in code.

### `app.json` Instellingen

```json
{
  "expo": {
    "name": "Lumia",
    "slug": "lumia",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "nl.lumia.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "nl.lumia.app",
      "versionCode": 1
    }
  }
}
```

### `eas.json` Build Profielen

| Profiel | Doel |
|---|---|
| `development` | Lokaal testen in simulator |
| `preview` | Intern testen op eigen telefoon (APK/IPA) |
| `production` | App Store / Play Store inzending |

---

## 11. App Store Voorbereiding

### Status
- ✅ Bundle ID ingesteld: `nl.lumia.app`
- ✅ App icoon gegenereerd (1024×1024 px)
- ✅ Splash screen geconfigureerd
- ✅ iOS permissions beschreven (notificaties, Face ID)
- ✅ Android adaptive icon ingesteld
- ✅ `eas.json` aangemaakt met alle profielen
- ⏳ Apple Developer Program account (€99/jaar) — in behandeling

### Volgende Stappen

1. **Apple Developer Program activeren** — na betaling en bevestigingsmail
2. **EAS CLI installeren** op je computer:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **App registreren** bij Expo/EAS:
   ```bash
   eas build:configure
   ```
4. **Apple Team ID invullen** in `eas.json` → `submit.production.ios`
5. **Productie build starten:**
   ```bash
   eas build --platform ios --profile production
   ```
6. **Insturen naar App Store:**
   ```bash
   eas submit --platform ios --profile production
   ```

### App Store Connect Gegevens (nog in te vullen)

| Veld | Waarde |
|---|---|
| App naam | Lumia |
| Categorie | Social Networking |
| Minimale leeftijd | 16+ |
| Privacy Policy URL | Vereist (live URL) |
| Steunkontact e-mail | support@lumia.nl |

---

## 12. Lokaal Starten

### Vereisten
- Node.js 18+
- pnpm
- Expo Go app op telefoon (voor live preview)

### Installatie
```bash
pnpm install
```

### Services starten

**API Server:**
```bash
pnpm --filter @workspace/api-server run dev
# Draait op http://localhost:8080
```

**Expo App:**
```bash
pnpm --filter @workspace/lumia run dev
# Scan QR code met Expo Go voor mobiele preview
```

### Admin Account
Voor toegang tot het Admin Dashboard gebruik je gebruikers-ID:
```
LUMIA_ADMIN_001
```

---

## 13. GitHub

**Repository:** [github.com/Vitaljobs/LUMIA-APP](https://github.com/Vitaljobs/LUMIA-APP)

**Branch:** `main`

### Code naar GitHub pushen
De pushfunctionaliteit werkt via het Replit Git paneel of via de API server push endpoint (tijdelijk toe te voegen indien nodig). Het `GITHUB_TOKEN` secret moet een geldig GitHub Classic token zijn met `repo` en `workflow` rechten.

> **Let op:** GitHub Push Protection kan pushes blokkeren als het token aanwezig is in `.replit`. Bij blokkering verschijnt een unblock URL op GitHub — klik deze aan om de push alsnog door te laten.

---

*Documentatie gegenereerd op 23 juni 2026 | Lumia 2026 v1.0.0*
