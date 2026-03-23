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
  shame: number;
  vitality: number;
  decay: number;
};

export type XPLogEntry = {
  id: string;
  action: string;
  xp: number;
  timestamp: number;
  category: "honor" | "shame" | "vitality" | "decay" | "social";
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
  shame: 13,
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
  { id: "x4", action: "Reactie te laat ingetrokken", xp: -8, timestamp: Date.now() - 7200000, category: "shame" },
  { id: "x5", action: "XP gift ontvangen van Sophia", xp: +25, timestamp: Date.now() - 9000000, category: "social" },
  { id: "x6", action: "Tuin water gegeven", xp: +3, timestamp: Date.now() - 10800000, category: "vitality" },
  { id: "x7", action: "Vriend verzoek geaccepteerd", xp: +12, timestamp: Date.now() - 14400000, category: "social" },
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
      { id: "m3", senderId: "u1", senderName: "Sophia R.", text: "Hier is wat XP als dank!", xpGift: 25, timestamp: Date.now() - 3400000 },
    ],
    lastMessage: "Hier is wat XP als dank!",
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

type LumiaContextType = {
  projectId: string;
  user: UserProfile;
  meters: Meter;
  xpLog: XPLogEntry[];
  statements: Statement[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  chats: ChatThread[];
  gardenVitality: number;
  gardenLevel: number;
  doGardenAction: (action: "water" | "feed" | "prune" | "pet") => void;
  voteOnStatement: (statementId: string, optionIndex: number) => void;
  addStatement: (statement: Omit<Statement, "id" | "votes" | "timestamp">) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  sendMessage: (chatId: string, text: string, xpGift?: number) => void;
  addXPLog: (entry: Omit<XPLogEntry, "id" | "timestamp">) => void;
};

const LumiaContext = createContext<LumiaContextType | null>(null);

export function LumiaProvider({ children }: { children: React.ReactNode }) {
  const [meters, setMeters] = useState<Meter>(defaultMeters);
  const [xpLog, setXPLog] = useState<XPLogEntry[]>(mockXPLog);
  const [statements, setStatements] = useState<Statement[]>(mockStatements);
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [chats, setChats] = useState<ChatThread[]>(mockChats);
  const [gardenVitality, setGardenVitality] = useState(64);
  const [gardenLevel, setGardenLevel] = useState(3);

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
        newVotes[optionIndex]++;
        return { ...s, votes: newVotes, myVote: optionIndex };
      })
    );
    addXPLog({ action: "Op stelling gestemd", xp: 3, category: "social" });
  }, [addXPLog]);

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
  }, [addXPLog]);

  const acceptFriendRequest = useCallback((requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;
    setFriends((prev) => [...prev, req.from]);
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    setChats((prev) => [
      {
        id: "c" + Date.now(),
        friend: req.from,
        messages: [],
        lastMessage: undefined,
      },
      ...prev,
    ]);
    addXPLog({ action: "Vriendverzoek geaccepteerd", xp: 12, category: "social" });
  }, [friendRequests, addXPLog]);

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
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text }
          : c
      )
    );
    if (xpGift) {
      addXPLog({ action: `XP gift verstuurd (${xpGift} XP)`, xp: -xpGift, category: "social" });
    }
  }, [addXPLog]);

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
        gardenVitality,
        gardenLevel,
        doGardenAction,
        voteOnStatement,
        addStatement,
        acceptFriendRequest,
        declineFriendRequest,
        sendMessage,
        addXPLog,
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
