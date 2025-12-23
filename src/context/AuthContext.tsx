"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/lib/firebase";

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    ageRange?: string;
    knownConditions?: string[];
    language?: string;
    onboardingComplete?: boolean;
    createdAt: Date;
    lastPeriodStart?: Date;
    averageCycleLength?: number;
}

// Demo user for testing without Firebase
const DEMO_USER: UserProfile = {
    uid: "demo-user-123",
    email: "demo@ovira.ai",
    displayName: "Demo User",
    ageRange: "25-34",
    knownConditions: [],
    language: "en",
    onboardingComplete: true,
    createdAt: new Date(),
    lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    averageCycleLength: 28,
};

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isDemoMode: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<User | null>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [inDemoMode, setInDemoMode] = useState(false);

    const fetchUserProfile = async (uid: string) => {
        if (isDemoMode || !db) {
            setUserProfile(DEMO_USER);
            return;
        }
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                setUserProfile(null);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        }
    };

    useEffect(() => {
        // In demo mode, skip Firebase auth
        if (isDemoMode) {
            setLoading(false);
            return;
        }

        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const enterDemoMode = () => {
        setInDemoMode(true);
        setUserProfile(DEMO_USER);
        setLoading(false);
    };

    const signIn = async (email: string, password: string) => {
        if (isDemoMode || inDemoMode || !auth) {
            enterDemoMode();
            return;
        }
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string): Promise<User | null> => {
        if (isDemoMode || inDemoMode || !auth || !db) {
            enterDemoMode();
            return null;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            createdAt: new Date(),
            onboardingComplete: false,
        });
        return result.user;
    };

    const signInWithGoogle = async () => {
        if (isDemoMode || inDemoMode || !auth || !db) {
            enterDemoMode();
            return;
        }
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, "users", result.user.uid), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                createdAt: new Date(),
                onboardingComplete: false,
            });
        }
        await fetchUserProfile(result.user.uid);
    };

    const signOut = async () => {
        if (isDemoMode || inDemoMode) {
            setInDemoMode(false);
            setUserProfile(null);
            return;
        }
        if (auth) {
            await firebaseSignOut(auth);
        }
        setUserProfile(null);
    };

    const refreshProfile = async () => {
        if (isDemoMode || inDemoMode) {
            setUserProfile(DEMO_USER);
            return;
        }
        if (user) {
            await fetchUserProfile(user.uid);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: inDemoMode ? ({ uid: DEMO_USER.uid, email: DEMO_USER.email } as User) : user,
                userProfile: inDemoMode ? DEMO_USER : userProfile,
                loading,
                isDemoMode: isDemoMode || inDemoMode,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                refreshProfile,
                enterDemoMode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
