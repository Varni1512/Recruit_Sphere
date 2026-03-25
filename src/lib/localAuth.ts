"use client";

export type LocalUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    provider: "password" | "google" | "github";
};

type StoredUserRecord = {
    uid: string;
    email: string;
    password?: string;
    displayName: string;
    photoURL: string;
    provider: "password" | "google" | "github";
};

type UserCredential = {
    user: LocalUser;
};

const USERS_KEY = "rs_auth_users_v1";
const SESSION_UID_KEY = "rs_auth_session_uid_v1";

const listeners = new Set<(user: LocalUser | null) => void>();

function canUseStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readUsers(): StoredUserRecord[] {
    if (!canUseStorage()) return [];
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUserRecord[]) {
    if (!canUseStorage()) return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toLocalUser(record: StoredUserRecord): LocalUser {
    return {
        uid: record.uid,
        email: record.email,
        displayName: record.displayName || null,
        photoURL: record.photoURL || null,
        provider: record.provider,
    };
}

function getUserByUid(uid: string | null): StoredUserRecord | null {
    if (!uid) return null;
    const users = readUsers();
    return users.find((u) => u.uid === uid) ?? null;
}

function setSessionUser(user: LocalUser | null) {
    auth.currentUser = user;
    if (!canUseStorage()) return;

    if (user?.uid) {
        localStorage.setItem(SESSION_UID_KEY, user.uid);
    } else {
        localStorage.removeItem(SESSION_UID_KEY);
    }
    listeners.forEach((cb) => cb(user));
}

function initCurrentUser(): LocalUser | null {
    if (!canUseStorage()) return null;
    const sessionUid = localStorage.getItem(SESSION_UID_KEY);
    const record = getUserByUid(sessionUid);
    return record ? toLocalUser(record) : null;
}

function createUid() {
    return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const auth: { currentUser: LocalUser | null; onAuthStateChanged: (cb: (user: LocalUser | null) => void) => () => void } = {
    currentUser: initCurrentUser(),
    onAuthStateChanged: (cb) => {
        listeners.add(cb);
        cb(auth.currentUser);
        return () => listeners.delete(cb);
    },
};

export class GoogleAuthProvider {
    readonly providerId = "google";
}

export class GithubAuthProvider {
    readonly providerId = "github";
}

export async function createUserWithEmailAndPassword(
    _auth: typeof auth,
    email: string,
    password: string
): Promise<UserCredential> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
        const err: any = new Error("Email already in use");
        err.code = "auth/email-already-in-use";
        throw err;
    }
    if ((password || "").length < 6) {
        const err: any = new Error("Password should be at least 6 characters");
        err.code = "auth/weak-password";
        throw err;
    }

    const record: StoredUserRecord = {
        uid: createUid(),
        email: normalizedEmail,
        password,
        displayName: normalizedEmail.split("@")[0] || "Candidate",
        photoURL: "",
        provider: "password",
    };

    users.push(record);
    writeUsers(users);

    const user = toLocalUser(record);
    setSessionUser(user);
    return { user };
}

export async function signInWithEmailAndPassword(
    _auth: typeof auth,
    email: string,
    password: string
): Promise<UserCredential> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    const record = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!record || record.password !== password) {
        const err: any = new Error("Invalid email or password");
        err.code = "auth/invalid-credential";
        throw err;
    }

    const user = toLocalUser(record);
    setSessionUser(user);
    return { user };
}

export async function signInWithPopup(
    _auth: typeof auth,
    provider: GoogleAuthProvider | GithubAuthProvider
): Promise<UserCredential> {
    const providerName = provider instanceof GoogleAuthProvider ? "google" : "github";
    const email = `${providerName}_user@local.dev`;
    const users = readUsers();
    let record = users.find((u) => u.email === email);

    if (!record) {
        record = {
            uid: createUid(),
            email,
            displayName: providerName === "google" ? "Google User" : "GitHub User",
            photoURL: "",
            provider: providerName,
        };
        users.push(record);
        writeUsers(users);
    }

    const user = toLocalUser(record);
    setSessionUser(user);
    return { user };
}

export async function updateProfile(
    user: LocalUser,
    data: { displayName?: string | null; photoURL?: string | null }
) {
    const users = readUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx === -1) return;

    if (typeof data.displayName !== "undefined") {
        users[idx].displayName = data.displayName ?? "";
        user.displayName = data.displayName ?? null;
    }
    if (typeof data.photoURL !== "undefined") {
        users[idx].photoURL = data.photoURL ?? "";
        user.photoURL = data.photoURL ?? null;
    }

    writeUsers(users);
    setSessionUser({ ...user });
}

export async function updateEmail(user: LocalUser, newEmail: string) {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const users = readUsers();
    
    // Check if new email is taken by another user
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.uid !== user.uid);
    if (existing) {
        throw new Error("Email already in use");
    }

    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx !== -1) {
        users[idx].email = normalizedEmail;
        user.email = normalizedEmail;
        writeUsers(users);
        setSessionUser({ ...user });
    }
}

export async function signOut(_auth: typeof auth) {
    setSessionUser(null);
}
