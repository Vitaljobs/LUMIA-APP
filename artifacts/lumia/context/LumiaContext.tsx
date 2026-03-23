import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Meter = {
  honor: number;
  reflectie: number;
  vitality: number;
  decay: number;
};

export type XPLogEntry = {
  id: string;
  action: string;
  xp: number;
  timestamp: number;
  category: "honor" | "reflectie" | "vitality" | "decay" | "social";
};

export type Statement = {
  id: string;
  text: string;
  options: [string, string, string];
  votes: [number, number, number];
  author: string;
  authorId: string;
  timestamp: number;
  anonymous: boolean;
  photo?: string;
  link?: string;
  myVote?: number;
};

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  xpGift?: number;
  timestamp: number;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  honor: number;
  vitality: number;
  isOnline: boolean;
  xp: number;
};

export type FriendRequest = {
  id: string;
  from: Friend;
  timestamp: number;
};

export type ChatThread = {
  id: string;
  friend: Friend;
  messages: Message[];
  lastMessage?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  isAdmin: boolean;
};

export type Notification = {
  id: string;
  type: "xp_gift" | "friend_request" | "vote" | "honor_change" | "message" | "system";
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
};

const ADMIN_USER_ID = "LUMIA_ADMIN_001";
const PROJECT_ID = "LUMIA_2026";

// ─── API base ────────────────────────────────────────────────────────────────

function getApiBase() {
  if (typeof window !== "undefined" && window.location?.hostname !== "localhost") {
    return "/api";
  }
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

// ─── DB → App mappers ────────────────────────────────────────────────────────

function mapStatement(row: any): Statement {
  return {
    id: row.id,
    text: row.text,
    options: [row.option_0, row.option_1, row.option_2],
    votes: [Number(row.votes_0), Number(row.votes_1), Number(row.votes_2)],
    author: row.anonymous ? "Anoniem" : row.author,
    authorId: row.author_id,
    timestamp: new Date(row.created_at).getTime(),
    anonymous: row.anonymous,
    link: row.link ?? undefined,
    myVote: undefined,
  };
}

function mapXPEntry(row: any): XPLogEntry {
  return {
    id: row.id,
    action: row.action,
    xp: row.xp,
    timestamp: new Date(row.created_at).getTime(),
    category: row.category,
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    timestamp: new Date(row.created_at).getTime(),
    read: row.read,
    data: row.data ?? undefined,
  };
}

function mapFriend(row: any): Friend {
  return {
    id: row.friend_id,
    name: row.friend_name,
    avatar: row.friend_avatar,
    honor: row.honor,
    vitality: row.vitality,
    isOnline: row.is_online,
    xp: row.xp,
  };
}

// ─── Default / seed data ─────────────────────────────────────────────────────

const defaultMeters: Meter = { honor: 76, reflectie: 13, vitality: 91, decay: 3 };
const defaultUser: UserProfile = {
  id: ADMIN_USER_ID, name: "Lumia Admin", avatar: "🌿", xp: 4200, level: 12, isAdmin: true,
};

const seedStatements = [
  {
    text: "Vertrouwen is de basis van alle echte verbindingen.",
    option_0: "Volledig mee eens", option_1: "Gedeeltelijk", option_2: "Oneens",
    votes_0: 45, votes_1: 23, votes_2: 8,
    author: "Sophia R.", author_id: "u1", anonymous: false,
  },
  {
    text: "Anonimiteit online zorgt voor minder eerlijkheid.",
    option_0: "Mee eens", option_1: "Soms", option_2: "Oneens",
    votes_0: 32, votes_1: 18, votes_2: 14,
    author: "Anoniem", author_id: "u2", anonymous: true,
  },
  {
    text: "XP zou ook voor offline acties moeten gelden.",
    option_0: "Zeker!", option_1: "Misschien", option_2: "Nee",
    votes_0: 61, votes_1: 27, votes_2: 5,
    author: "Marcus T.", author_id: "u2", anonymous: false,
  },
];

const seedXPLog = [
  { action: "Eerlijke reactie gegeven", xp: 15, category: "honor" },
  { action: "Stelling geplaatst", xp: 10, category: "social" },
  { action: "Tuin gevoed", xp: 5, category: "vitality" },
  { action: "Reflectie moment geregistreerd", xp: -8, category: "reflectie" },
  { action: "XP gift ontvangen van Sophia", xp: 25, category: "social" },
];

const seedNotifications = [
  { type: "xp_gift", title: "XP Gift ontvangen!", body: "Sophia R. stuurde je 25 XP als dank voor jouw eerlijkheid.", user_id: ADMIN_USER_ID, data: { xp: 25 } },
  { type: "friend_request", title: "Nieuw vriendverzoek", body: "Nina M. wil jou toevoegen als vriend.", user_id: ADMIN_USER_ID, data: {} },
  { type: "system", title: "Trust-Gravity actief", body: "Jouw stemgewicht is nu 0.76x. Blijf eerlijk om dit te verhogen.", user_id: ADMIN_USER_ID, data: {} },
];

const seedFriends = [
  { friend_id: "u1", friend_name: "Sophia R.", friend_avatar: "🌸", honor: 88, vitality: 72, is_online: true, xp: 3400 },
  { friend_id: "u2", friend_name: "Marcus T.", friend_avatar: "🔥", honor: 65, vitality: 90, is_online: false, xp: 2100 },
  { friend_id: "u3", friend_name: "Aisha K.", friend_avatar: "⚡", honor: 95, vitality: 83, is_online: true, xp: 5500 },
  { friend_id: "u4", friend_name: "Leo V.", friend_avatar: "🌊", honor: 72, vitality: 61, is_online: false, xp: 1800 },
];

// ─── Context type ────────────────────────────────────────────────────────────

type LumiaContextType = {
  projectId: string;
  user: UserProfile;
  meters: Meter;
  xpLog: XPLogEntry[];
  statements: Statement[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  chats: ChatThread[];
  notifications: Notification[];
  unreadNotifCount: number;
  gardenVitality: number;
  gardenLevel: number;
  hasCompletedOnboarding: boolean;
  dbReady: boolean;
  completeOnboarding: () => void;
  doGardenAction: (action: "water" | "feed" | "prune" | "pet") => void;
  voteOnStatement: (statementId: string, optionIndex: number) => void;
  addStatement: (statement: Omit<Statement, "id" | "votes" | "timestamp">) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  sendMessage: (chatId: string, text: string, xpGift?: number) => void;
  addXPLog: (entry: Omit<XPLogEntry, "id" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  getTrustGravityWeight: (userId?: string) => number;
};

const LumiaContext = createContext<LumiaContextType | null>(null);

export function LumiaProvider({ children }: { children: React.ReactNode }) {
  const [meters, setMeters] = useState<Meter>(defaultMeters);
  const [xpLog, setXPLog] = useState<XPLogEntry[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gardenVitality, setGardenVitality] = useState(64);
  const [gardenLevel, setGardenLevel] = useState(3);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const seeded = useRef(false);

  // ── Load onboarding state ─────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem("lumia_onboarding_done").then((val) => {
      if (val === "true") setHasCompletedOnboarding(true);
    });
  }, []);

  // ── Seed DB helper ────────────────────────────────────────────────────────
  const seedDatabase = useCallback(async () => {
    if (seeded.current) return;
    seeded.current = true;
    try {
      // Meters
      await apiFetch(`/lumia/meters/${ADMIN_USER_ID}/upsert`, {
        method: "POST",
        body: JSON.stringify(defaultMeters),
      }).catch(() => {});

      // Statements
      for (const s of seedStatements) {
        await apiFetch("/lumia/statements", { method: "POST", body: JSON.stringify(s) }).catch(() => {});
      }

      // XP log
      for (const x of seedXPLog) {
        await apiFetch(`/lumia/xp-log/${ADMIN_USER_ID}`, { method: "POST", body: JSON.stringify(x) }).catch(() => {});
      }

      // Notifications
      for (const n of seedNotifications) {
        await apiFetch(`/lumia/notifications/${ADMIN_USER_ID}`, { method: "POST", body: JSON.stringify(n) }).catch(() => {});
      }

      // Friends
      for (const f of seedFriends) {
        await apiFetch(`/lumia/friends/${ADMIN_USER_ID}`, { method: "POST", body: JSON.stringify(f) }).catch(() => {});
      }
    } catch {}
  }, []);

  // ── Load all data from backend ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [metersRow, stmtRows, xpRows, notifRows, friendRows] = await Promise.all([
        apiFetch(`/lumia/meters/${ADMIN_USER_ID}`),
        apiFetch("/lumia/statements"),
        apiFetch(`/lumia/xp-log/${ADMIN_USER_ID}`),
        apiFetch(`/lumia/notifications/${ADMIN_USER_ID}`),
        apiFetch(`/lumia/friends/${ADMIN_USER_ID}`),
      ]);

      // Set meters
      if (metersRow && !metersRow.error) {
        setMeters({
          honor: metersRow.honor ?? defaultMeters.honor,
          reflectie: metersRow.reflectie ?? defaultMeters.reflectie,
          vitality: metersRow.vitality ?? defaultMeters.vitality,
          decay: metersRow.decay ?? defaultMeters.decay,
        });
      }

      // Set statements (seed if empty)
      if (Array.isArray(stmtRows) && stmtRows.length > 0) {
        setStatements(stmtRows.map(mapStatement));
      }

      // Set XP log (seed if empty)
      if (Array.isArray(xpRows) && xpRows.length > 0) {
        setXPLog(xpRows.map(mapXPEntry));
      }

      // Set notifications
      if (Array.isArray(notifRows) && notifRows.length > 0) {
        setNotifications(notifRows.map(mapNotification));
      }

      // Set friends
      if (Array.isArray(friendRows) && friendRows.length > 0) {
        setFriends(friendRows.map(mapFriend));

        // Build mock chats for each friend
        setChats(
          friendRows.map((f: any, i: number) => ({
            id: `chat_${f.friend_id}`,
            friend: mapFriend(f),
            messages: i === 0 ? [{
              id: "m_seed",
              senderId: f.friend_id,
              senderName: f.friend_name,
              text: "Hey! Goed om je te zien in Lumia 🌿",
              timestamp: Date.now() - 3600000,
            }] : [],
            lastMessage: i === 0 ? "Hey! Goed om je te zien in Lumia 🌿" : undefined,
          }))
        );
      }

      setDbReady(true);

      // Seed empty data
      const isEmpty = stmtRows.length === 0 || xpRows.length === 0;
      if (isEmpty) {
        await seedDatabase();
        // Reload after seeding
        const [stmtRows2, xpRows2, notifRows2, friendRows2] = await Promise.all([
          apiFetch("/lumia/statements"),
          apiFetch(`/lumia/xp-log/${ADMIN_USER_ID}`),
          apiFetch(`/lumia/notifications/${ADMIN_USER_ID}`),
          apiFetch(`/lumia/friends/${ADMIN_USER_ID}`),
        ]);
        if (stmtRows2.length > 0) setStatements(stmtRows2.map(mapStatement));
        if (xpRows2.length > 0) setXPLog(xpRows2.map(mapXPEntry));
        if (notifRows2.length > 0) setNotifications(notifRows2.map(mapNotification));
        if (friendRows2.length > 0) {
          setFriends(friendRows2.map(mapFriend));
          setChats(friendRows2.map((f: any, i: number) => ({
            id: `chat_${f.friend_id}`,
            friend: mapFriend(f),
            messages: i === 0 ? [{ id: "m_seed", senderId: f.friend_id, senderName: f.friend_name, text: "Hey! Goed om je te zien in Lumia 🌿", timestamp: Date.now() - 3600000 }] : [],
            lastMessage: i === 0 ? "Hey! Goed om je te zien in Lumia 🌿" : undefined,
          })));
        }
      }
    } catch {
      // Fallback: show mock data if backend unreachable
      setStatements([
        { id: "s1", text: "Vertrouwen is de basis van alle echte verbindingen.", options: ["Volledig mee eens", "Gedeeltelijk", "Oneens"], votes: [45, 23, 8], author: "Sophia R.", authorId: "u1", timestamp: Date.now() - 3600000, anonymous: false },
        { id: "s2", text: "Anonimiteit online zorgt voor minder eerlijkheid.", options: ["Mee eens", "Soms", "Oneens"], votes: [32, 18, 14], author: "Anoniem", authorId: "u2", timestamp: Date.now() - 7200000, anonymous: true },
        { id: "s3", text: "XP zou ook voor offline acties moeten gelden.", options: ["Zeker!", "Misschien", "Nee"], votes: [61, 27, 5], author: "Marcus T.", authorId: "u2", timestamp: Date.now() - 10800000, anonymous: false, myVote: 0 },
      ]);
      setXPLog([
        { id: "x1", action: "Eerlijke reactie gegeven", xp: 15, timestamp: Date.now() - 1800000, category: "honor" },
        { id: "x2", action: "Stelling geplaatst", xp: 10, timestamp: Date.now() - 3600000, category: "social" },
        { id: "x3", action: "Tuin gevoed", xp: 5, timestamp: Date.now() - 5400000, category: "vitality" },
        { id: "x4", action: "Reflectie moment geregistreerd", xp: -8, timestamp: Date.now() - 7200000, category: "reflectie" },
        { id: "x5", action: "XP gift ontvangen van Sophia", xp: 25, timestamp: Date.now() - 9000000, category: "social" },
      ]);
      setFriends([
        { id: "u1", name: "Sophia R.", avatar: "🌸", honor: 88, vitality: 72, isOnline: true, xp: 3400 },
        { id: "u2", name: "Marcus T.", avatar: "🔥", honor: 65, vitality: 90, isOnline: false, xp: 2100 },
        { id: "u3", name: "Aisha K.", avatar: "⚡", honor: 95, vitality: 83, isOnline: true, xp: 5500 },
      ]);
      setNotifications([
        { id: "n1", type: "xp_gift", title: "XP Gift ontvangen!", body: "Sophia R. stuurde je 25 XP.", timestamp: Date.now() - 3400000, read: false },
        { id: "n2", type: "system", title: "Trust-Gravity actief", body: "Jouw stemgewicht is 0.76x.", timestamp: Date.now() - 86400000, read: true },
      ]);
      setFriendRequests([
        { id: "fr1", from: { id: "u5", name: "Nina M.", avatar: "🌙", honor: 81, vitality: 75, isOnline: true, xp: 2900 }, timestamp: Date.now() - 1200000 },
      ]);
    }
  }, [seedDatabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Computed ─────────────────────────────────────────────────────────────

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem("lumia_onboarding_done", "true");
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const getTrustGravityWeight = useCallback((userId?: string) => {
    if (!userId || userId === defaultUser.id) {
      return Math.round((meters.honor / 100) * 100) / 100;
    }
    const friend = friends.find((f) => f.id === userId);
    if (friend) return Math.round((friend.honor / 100) * 100) / 100;
    return 0.5;
  }, [meters.honor, friends]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...n, id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(), read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    // Persist to DB
    apiFetch(`/lumia/notifications/${ADMIN_USER_ID}`, {
      method: "POST", body: JSON.stringify({ ...n, user_id: ADMIN_USER_ID }),
    }).catch(() => {});
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    apiFetch(`/lumia/notifications/${ADMIN_USER_ID}/${id}/read`, { method: "PATCH" }).catch(() => {});
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Mark each unread one via API
    notifications.filter((n) => !n.read).forEach((n) => {
      apiFetch(`/lumia/notifications/${ADMIN_USER_ID}/${n.id}/read`, { method: "PATCH" }).catch(() => {});
    });
  }, [notifications]);

  const addXPLog = useCallback((entry: Omit<XPLogEntry, "id" | "timestamp">) => {
    const newEntry: XPLogEntry = {
      ...entry, id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
    };
    setXPLog((prev) => [newEntry, ...prev]);
    apiFetch(`/lumia/xp-log/${ADMIN_USER_ID}`, {
      method: "POST", body: JSON.stringify(entry),
    }).catch(() => {});
  }, []);

  const doGardenAction = useCallback((action: "water" | "feed" | "prune" | "pet") => {
    const config = {
      water: { vitDelta: 8, xp: 3, label: "Tuin water gegeven", cat: "vitality" as const },
      feed: { vitDelta: 12, xp: 5, label: "Tuin gevoed", cat: "vitality" as const },
      prune: { vitDelta: 5, xp: 4, label: "Tuin gesnoeid", cat: "vitality" as const },
      pet: { vitDelta: 3, xp: 2, label: "Tuin geaaid", cat: "vitality" as const },
    };
    const c = config[action];
    setGardenVitality((v) => Math.min(100, v + c.vitDelta));
    setMeters((m) => ({ ...m, vitality: Math.min(100, m.vitality + Math.floor(c.vitDelta / 4)) }));
    addXPLog({ action: c.label, xp: c.xp, category: c.cat });
  }, [addXPLog]);

  const voteOnStatement = useCallback((statementId: string, optionIndex: number) => {
    const weight = Math.round((meters.honor / 100) * 10) / 10;
    // Optimistic update
    setStatements((prev) =>
      prev.map((s) => {
        if (s.id !== statementId || s.myVote !== undefined) return s;
        const newVotes = [...s.votes] as [number, number, number];
        newVotes[optionIndex] = Math.round(newVotes[optionIndex] + weight);
        return { ...s, votes: newVotes, myVote: optionIndex };
      })
    );
    // Persist to DB
    apiFetch(`/lumia/statements/${statementId}/vote`, {
      method: "POST",
      body: JSON.stringify({ user_id: ADMIN_USER_ID, option_index: optionIndex, trust_weight: weight }),
    }).catch(() => {});
    addXPLog({ action: "Op stelling gestemd", xp: 3, category: "social" });
    addNotification({
      type: "vote",
      title: "+3 XP — Stem uitgebracht!",
      body: `Jouw stem had een gewicht van ${weight}x (Trust-Gravity).`,
    });
  }, [addXPLog, addNotification, meters.honor]);

  const addStatement = useCallback((statement: Omit<Statement, "id" | "votes" | "timestamp">) => {
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newStatement: Statement = {
      ...statement, id: tempId, votes: [0, 0, 0], timestamp: Date.now(),
    };
    // Optimistic
    setStatements((prev) => [newStatement, ...prev]);

    // Persist to DB
    apiFetch("/lumia/statements", {
      method: "POST",
      body: JSON.stringify({
        text: statement.text,
        option_0: statement.options[0],
        option_1: statement.options[1],
        option_2: statement.options[2],
        author: statement.anonymous ? "Anoniem" : defaultUser.name,
        author_id: ADMIN_USER_ID,
        anonymous: statement.anonymous,
        link: statement.link ?? null,
      }),
    }).then((row) => {
      // Replace temp id with real db id
      if (row?.id) {
        setStatements((prev) => prev.map((s) => s.id === tempId ? { ...s, id: row.id } : s));
      }
    }).catch(() => {});

    addXPLog({ action: "Stelling geplaatst", xp: 10, category: "social" });
    setMeters((m) => ({ ...m, honor: Math.min(100, m.honor + 2) }));
    addNotification({ type: "system", title: "Stelling live!", body: "Je stelling is geplaatst en zichtbaar voor de community. +10 XP" });
  }, [addXPLog, addNotification]);

  const acceptFriendRequest = useCallback((requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;
    setFriends((prev) => [...prev, req.from]);
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    setChats((prev) => [
      { id: `chat_${req.from.id}`, friend: req.from, messages: [], lastMessage: undefined },
      ...prev,
    ]);
    addXPLog({ action: "Vriendverzoek geaccepteerd", xp: 12, category: "social" });
    addNotification({ type: "friend_request", title: "Vriend toegevoegd!", body: `${req.from.name} is nu jouw vriend. +12 XP` });
  }, [friendRequests, addXPLog, addNotification]);

  const declineFriendRequest = useCallback((requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const sendMessage = useCallback((chatId: string, text: string, xpGift?: number) => {
    const newMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      senderId: ADMIN_USER_ID,
      senderName: "Jij",
      text, xpGift, timestamp: Date.now(),
    };
    // Optimistic
    setChats((prev) =>
      prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, newMsg], lastMessage: text } : c)
    );
    // Persist
    apiFetch("/lumia/messages", {
      method: "POST",
      body: JSON.stringify({
        chat_id: chatId, sender_id: ADMIN_USER_ID,
        sender_name: "Jij", text, xp_gift: xpGift ?? null,
      }),
    }).catch(() => {});

    if (xpGift) {
      addXPLog({ action: `XP gift verstuurd (${xpGift} XP)`, xp: -xpGift, category: "social" });
      addNotification({ type: "xp_gift", title: `${xpGift} XP verstuurd`, body: `Je hebt ${xpGift} XP gegeven. Een genereuze daad verhoogt jouw Honor.` });
    }
  }, [addXPLog, addNotification]);

  return (
    <LumiaContext.Provider
      value={{
        projectId: PROJECT_ID,
        user: defaultUser,
        meters,
        xpLog,
        statements,
        friends,
        friendRequests,
        chats,
        notifications,
        unreadNotifCount,
        gardenVitality,
        gardenLevel,
        hasCompletedOnboarding,
        dbReady,
        completeOnboarding,
        doGardenAction,
        voteOnStatement,
        addStatement,
        acceptFriendRequest,
        declineFriendRequest,
        sendMessage,
        addXPLog,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        getTrustGravityWeight,
      }}
    >
      {children}
    </LumiaContext.Provider>
  );
}

export function useLumia() {
  const ctx = useContext(LumiaContext);
  if (!ctx) throw new Error("useLumia must be used within LumiaProvider");
  return ctx;
}
