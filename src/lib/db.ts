import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit,
} from "firebase/firestore";
import { db, isDemoMode } from "./firebase";

// Types
export interface SymptomLog {
    id?: string;
    userId: string;
    date: Date;
    flowLevel: "none" | "light" | "medium" | "heavy";
    painScale: number;
    mood: string;
    energyLevel: number;
    sleepHours: number;
    notes?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface HealthReport {
    id?: string;
    userId: string;
    generatedAt: Date;
    startDate: Date;
    endDate: Date;
    cycleData: {
        averageLength: number;
        periodDays: number;
    };
    symptoms: {
        averagePain: number;
        commonMoods: string[];
        averageEnergy: number;
        averageSleep: number;
    };
    risks: {
        level: "low" | "medium" | "high";
        flags: string[];
    };
    pdfUrl?: string;
}

// Demo data for testing without Firebase
const generateDemoLogs = (): SymptomLog[] => {
    const logs: SymptomLog[] = [];
    const moods = ["happy", "calm", "anxious", "irritable", "sad", "energetic"];
    const flows: ("none" | "light" | "medium" | "heavy")[] = ["none", "light", "medium", "heavy"];

    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Simulate period days (days 1-5 of cycle)
        const cycleDay = (14 - i) % 28;
        const isOnPeriod = cycleDay >= 1 && cycleDay <= 5;

        logs.push({
            id: `demo-log-${i}`,
            userId: "demo-user-123",
            date: date,
            flowLevel: isOnPeriod ? flows[Math.min(cycleDay, 3)] : "none",
            painScale: isOnPeriod ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3),
            mood: moods[Math.floor(Math.random() * moods.length)],
            energyLevel: Math.floor(Math.random() * 4) + 5,
            sleepHours: Math.floor(Math.random() * 3) + 6,
            notes: i === 0 ? "Feeling good today!" : undefined,
            createdAt: date,
        });
    }
    return logs;
};

let demoLogs = generateDemoLogs();

// Symptom Logs
export async function addSymptomLog(log: Omit<SymptomLog, "id" | "createdAt">) {
    if (isDemoMode || !db) {
        const newLog: SymptomLog = {
            ...log,
            id: `demo-log-${Date.now()}`,
            createdAt: new Date(),
        };
        demoLogs.unshift(newLog);
        return newLog.id!;
    }

    const docRef = await addDoc(collection(db, "symptomLogs"), {
        ...log,
        date: Timestamp.fromDate(log.date),
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateSymptomLog(logId: string, updates: Partial<SymptomLog>) {
    if (isDemoMode || !db) {
        const index = demoLogs.findIndex(l => l.id === logId);
        if (index !== -1) {
            demoLogs[index] = { ...demoLogs[index], ...updates, updatedAt: new Date() };
        }
        return;
    }

    const logRef = doc(db, "symptomLogs", logId);
    const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: Timestamp.now(),
    };
    if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
    }
    await updateDoc(logRef, updateData);
}

export async function deleteSymptomLog(logId: string) {
    if (isDemoMode || !db) {
        demoLogs = demoLogs.filter(l => l.id !== logId);
        return;
    }
    await deleteDoc(doc(db, "symptomLogs", logId));
}

export async function getSymptomLogs(userId: string, limitCount: number = 30) {
    if (isDemoMode || !db) {
        return demoLogs.slice(0, limitCount);
    }

    const q = query(
        collection(db, "symptomLogs"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as SymptomLog[];
}

export async function getSymptomLogsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
) {
    if (isDemoMode || !db) {
        return demoLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    const q = query(
        collection(db, "symptomLogs"),
        where("userId", "==", userId),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as SymptomLog[];
}

// Demo reports storage
let demoReports: HealthReport[] = [];

// Health Reports
export async function addHealthReport(report: Omit<HealthReport, "id">) {
    if (isDemoMode || !db) {
        const newReport: HealthReport = {
            ...report,
            id: `demo-report-${Date.now()}`,
        };
        demoReports.unshift(newReport);
        return newReport.id!;
    }

    const docRef = await addDoc(collection(db, "healthReports"), {
        ...report,
        generatedAt: Timestamp.fromDate(report.generatedAt),
        startDate: Timestamp.fromDate(report.startDate),
        endDate: Timestamp.fromDate(report.endDate),
    });
    return docRef.id;
}

export async function getHealthReports(userId: string) {
    if (isDemoMode || !db) {
        return demoReports;
    }

    const q = query(
        collection(db, "healthReports"),
        where("userId", "==", userId),
        orderBy("generatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        generatedAt: doc.data().generatedAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
    })) as HealthReport[];
}

export async function getHealthReport(reportId: string) {
    if (isDemoMode || !db) {
        return demoReports.find(r => r.id === reportId) || null;
    }

    const docSnap = await getDoc(doc(db, "healthReports", reportId));
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            generatedAt: data.generatedAt?.toDate(),
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
        } as HealthReport;
    }
    return null;
}

// User Profile
export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
    if (isDemoMode || !db) {
        console.log("Demo mode: Profile update simulated", updates);
        return;
    }
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
}

// Calculate streak
export async function calculateStreak(userId: string): Promise<number> {
    const logs = await getSymptomLogs(userId, 60);
    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedLogs = logs.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        const hasLog = sortedLogs.some((log) => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === checkDate.getTime();
        });

        if (hasLog) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}
