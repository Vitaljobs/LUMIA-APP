import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const defaultUser: UserProfile = {
  id: ADMIN_USER_ID,
  name: "Lumia Admin",
  avatar: "🌿",
  xp: 4200,
  level: 12,
  isAdmin: true,
};

const defaultMeters: Meter = {
  honor: 76,
  reflectie: 13,
  vitality: 91,
  decay: 3,
};

const mockFriends: Friend[] = [
  { id: "u1", name: "Sophia R.", avatar: "🌸", honor: 88, vitality: 72, isOnline: true, xp: 3400 },
  { id: "u2", name: "Marcus T.", avatar: "🔥", honor: 65, vitality: 90, isOnline: false, xp: 2100 },
  { id: "u3", name: "Aisha K.", avatar: "⚡", honor: 95, vitality: 83, isOnline: true, xp: 5500 },
  { id: "u4", name: "Leo V.", avatar: "🌊", honor: 72, vitality: 61, isOnline: false, xp: 1800 },
];

const mockStatements: Statement[] = [
  {
    id: "s1",
    text: "Vertrouwen is de basis van alle echte verbindingen.",
    options: ["Volledig mee eens", "Gedeeltelijk", "Oneens"],
    votes: [45, 23, 8],
    author: "Sophia R.",
    authorId: "u1",
    timestamp: Date.now() - 3600000,
    anonymous: false,
    myVote: undefined,
  },
  {
    id: "s2",
    text: "Anonimiteit online zorgt voor minder eerlijkheid.",
    options: ["Mee eens", "Soms", "Oneens"],
    votes: [32, 18, 14],
    author: "Anoniem",
    authorId: "u2",
    timestamp: Date.now() - 7200000,
    anonymous: true,
    myVote: undefined,
  },
  {
    id: "s3",
    text: "XP zou ook voor offline acties moeten gelden.",
    options: ["Zeker!", "Misschien", "Nee"],
    votes: [61, 27, 5],
    author: "Marcus T.",
    authorId: "u2",
    timestamp: Date.now() - 10800000,
    anonymous: false,
    myVote: 0,
  },
];

const mockXPLog: XPLogEntry[] = [
  { id: "x1", action: "Eerlijke reactie gegeven", xp: +15, timestamp: Date.now() - 1800000, category: "honor" },
  { id: "x2", action: "Stelling geplaatst", xp: +10, timestamp: Date.now() - 3600000, category: "social" },
  { id: "x3", action: "Tuin gevoed", xp: +5, timestamp: Date.now() - 5400000, category: "vitality" },
  { id: "x4", action: "Reflectie moment geregistreerd", xp: -8, timestamp: Date.now() - 7200000, category: "reflectie" },
  { id: "x5", action: "XP gift ontvangen van Sophia", xp: +25, timestamp: Date.now() - 9000000, category: "social" },
  { id: "x6", action: "Tuin water gegeven", xp: +3, timestamp: Date.now() - 10800000, category: "vitality" },
  { id: "x7", action: "Vriendverzoek geaccepteerd", xp: +12, timestamp: Date.now() - 14400000, category: "social" },
];

const mockFriendRequests: FriendRequest[] = [
  { id: "fr1", from: { id: "u5", name: "Nina M.", avatar: "🌙", honor: 81, vitality: 75, isOnline: true, xp: 2900 }, timestamp: Date.now() - 1200000 },
];

const mockChats: ChatThread[] = [
  {
    id: "c1",
    friend: mockFriends[0],
    messages: [
      { id: "m1", senderId: "u1", senderName: "Sophia R.", text: "Hey! Goed om je te zien in Lumia 🌿", timestamp: Date.now() - 3600000 },
      { id: "m2", senderId: ADMIN_USER_ID, senderName: "Jij", text: "Dank je! Jouw stelling was echt interessant.", timestamp: Date.now() - 3500000 },
      { id: "m3", senderId: "u1", senderName: "Sophia R.", text: "Hier is wat XP als dank voor jouw eerlijkheid!", xpGift: 25, timestamp: Date.now() - 3400000 },
    ],
    lastMessage: "Hier is wat XP als dank voor jouw eerlijkheid!",
  },
  {
    id: "c2",
    friend: mockFriends[2],
    messages: [
      { id: "m4", senderId: "u3", senderName: "Aisha K.", text: "Jij hebt de hoogste Honor score dit seizoen!", timestamp: Date.now() - 86400000 },
    ],
    lastMessage: "Jij hebt de hoogste Honor score dit seizoen!",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "xp_gift",
    title: "XP Gift ontvangen!",
    body: "Sophia R. stuurde je 25 XP als dank voor jouw eerlijkheid.",
    timestamp: Date.now() - 3400000,
    read: false,
    data: { xp: 25, from: "Sophia R." },
  },
  {
    id: "n2",
    type: "friend_request",
    title: "Nieuw vriendverzoek",
    body: "Nina M. wil jou toevoegen als vriend.",
    timestamp: Date.now() - 1200000,
    read: false,
    data: { from: "Nina M." },
  },
  {
    id: "n3",
    type: "vote",
    title: "Jouw stelling scoort!",
    body: "93 mensen hebben op jouw stelling gestemd.",
    timestamp: Date.now() - 7200000,
    read: true,
    data: { votes: 93 },
  },
  {
    id: "n4",
    type: "honor_change",
    title: "Honor gestegen!",
    body: "Jouw Honor score steeg naar 76 door consistente eerlijkheid.",
    timestamp: Date.now() - 86400000,
    read: true,
    data: { newValue: 76 },
  },
  {
    id: "n5",
    type: "system",
    title: "Trust-Gravity update",
    body: "Jouw stemgewicht is nu 0.76x. Blijf eerlijk om dit te verhogen.",
    timestamp: Date.now() - 172800000,
    read: true,
  },
];

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
  const [xpLog, setXPLog] = useState<XPLogEntry[]>(mockXPLog);
  const [statements, setStatements] = useState<Statement[]>(mockStatements);
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [chats, setChats] = useState<ChatThread[]>(mockChats);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [gardenVitality, setGardenVitality] = useState(64);
  const [gardenLevel, setGardenLevel] = useState(3);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("lumia_onboarding_done").then((val) => {
      if (val === "true") setHasCompletedOnboarding(true);
    });
  }, []);

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

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...n,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addXPLog = useCallback((entry: Omit<XPLogEntry, "id" | "timestamp">) => {
    const newEntry: XPLogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
    };
    setXPLog((prev) => [newEntry, ...prev]);
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
    setStatements((prev) =>
      prev.map((s) => {
        if (s.id !== statementId || s.myVote !== undefined) return s;
        const newVotes = [...s.votes] as [number, number, number];
        // Trust-Gravity: user's vote counts proportionally to their honor score
        const weight = Math.round(meters.honor / 100 * 10) / 10;
        newVotes[optionIndex] = Math.round(newVotes[optionIndex] + weight);
        return { ...s, votes: newVotes, myVote: optionIndex };
      })
    );
    addXPLog({ action: "Op stelling gestemd", xp: 3, category: "social" });
    addNotification({
      type: "vote",
      title: "+3 XP — Stem uitgebracht!",
      body: `Jouw stem had een gewicht van ${getTrustGravityWeight()}x (Trust-Gravity).`,
    });
  }, [addXPLog, addNotification, meters.honor, getTrustGravityWeight]);

  const addStatement = useCallback((statement: Omit<Statement, "id" | "votes" | "timestamp">) => {
    const newStatement: Statement = {
      ...statement,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      votes: [0, 0, 0],
      timestamp: Date.now(),
    };
    setStatements((prev) => [newStatement, ...prev]);
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
      { id: "c" + Date.now(), friend: req.from, messages: [], lastMessage: undefined },
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
      text,
      xpGift,
      timestamp: Date.now(),
    };
    setChats((prev) =>
      prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, newMsg], lastMessage: text } : c)
    );
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
