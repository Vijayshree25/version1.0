import { SymptomLog } from "./db";

export interface HealthRisk {
    level: "low" | "medium" | "high";
    flags: string[];
    explanation: string;
    disclaimer: string;
}

export function analyzeHealthRisks(logs: SymptomLog[]): HealthRisk {
    const flags: string[] = [];
    let riskLevel: "low" | "medium" | "high" = "low";

    if (logs.length === 0) {
        return {
            level: "low",
            flags: [],
            explanation: "Not enough data to analyze. Keep logging your symptoms for personalized insights.",
            disclaimer: "This is not a medical diagnosis. Please consult a healthcare provider for medical advice.",
        };
    }

    // Calculate averages
    const avgPain = logs.reduce((sum, log) => sum + log.painScale, 0) / logs.length;
    const avgEnergy = logs.reduce((sum, log) => sum + log.energyLevel, 0) / logs.length;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleepHours, 0) / logs.length;
    const heavyFlowDays = logs.filter((log) => log.flowLevel === "heavy").length;
    const heavyFlowPercentage = (heavyFlowDays / logs.length) * 100;

    // Check for anemia indicators (heavy bleeding + fatigue)
    if (heavyFlowPercentage > 30 && avgEnergy < 4) {
        flags.push("Possible anemia indicator: Heavy bleeding combined with low energy levels");
        riskLevel = "medium";
    }

    // Check for severe pain
    if (avgPain >= 7) {
        flags.push("High pain levels detected: Average pain score is above 7/10");
        riskLevel = riskLevel === "high" ? "high" : "medium";
    }

    // Check for sleep issues
    if (avgSleep < 5) {
        flags.push("Sleep deprivation: Average sleep is below recommended levels");
        if (riskLevel === "low") riskLevel = "medium";
    }

    // Check mood patterns (looking for concerning patterns)
    const moodCounts: Record<string, number> = {};
    logs.forEach((log) => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    });

    const sadOrAnxiousDays = (moodCounts["sad"] || 0) + (moodCounts["anxious"] || 0);
    if (sadOrAnxiousDays / logs.length > 0.5) {
        flags.push("Mood patterns: More than half of logged days show sad or anxious mood");
        if (riskLevel === "low") riskLevel = "medium";
    }

    // Check for very heavy bleeding (potential urgent concern)
    if (heavyFlowPercentage > 50) {
        flags.push("Prolonged heavy bleeding: Consider discussing with a healthcare provider");
        riskLevel = "high";
    }

    // Generate explanation
    let explanation = "";
    if (flags.length === 0) {
        explanation = "Your recent logs show a healthy pattern. Keep up the great work with tracking your health!";
    } else if (riskLevel === "high") {
        explanation = `We've identified ${flags.length} potential concern(s) that may need attention. While these are not diagnoses, we recommend discussing these patterns with your healthcare provider soon.`;
    } else if (riskLevel === "medium") {
        explanation = `We've noticed ${flags.length} pattern(s) worth monitoring. These aren't necessarily concerning but tracking them over time can provide valuable insights for you and your doctor.`;
    } else {
        explanation = "Minor patterns detected. Continue logging to help identify trends.";
    }

    return {
        level: riskLevel,
        flags,
        explanation,
        disclaimer: "⚕️ This is not a medical diagnosis. The analysis is based on general health patterns and should not replace professional medical advice. Always consult a qualified healthcare provider for medical concerns.",
    };
}

// Calculate cycle predictions
export function predictNextPeriod(
    lastPeriodStart: Date | null,
    averageCycleLength: number = 28
): { nextPeriod: Date; daysUntil: number; currentDay: number } | null {
    if (!lastPeriodStart) return null;

    const today = new Date();
    const lastStart = new Date(lastPeriodStart);

    // Calculate current cycle day
    const daysSinceLastPeriod = Math.floor(
        (today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentDay = (daysSinceLastPeriod % averageCycleLength) + 1;

    // Calculate next period
    const cyclesSinceLast = Math.floor(daysSinceLastPeriod / averageCycleLength);
    const nextPeriod = new Date(lastStart);
    nextPeriod.setDate(nextPeriod.getDate() + (cyclesSinceLast + 1) * averageCycleLength);

    const daysUntil = Math.ceil(
        (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
        nextPeriod,
        daysUntil: Math.max(0, daysUntil),
        currentDay,
    };
}
