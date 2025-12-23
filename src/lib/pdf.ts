import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HealthReport, SymptomLog } from "./db";
import { format } from "date-fns";

export async function generateHealthPDF(
    report: Omit<HealthReport, "id">,
    logs: SymptomLog[]
): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const primaryColor: [number, number, number] = [139, 92, 246]; // Lavender
    const secondaryColor: [number, number, number] = [20, 184, 166]; // Teal
    const textColor: [number, number, number] = [30, 41, 59]; // Slate 800
    const lightGray: [number, number, number] = [148, 163, 184]; // Slate 400

    let yPos = 20;

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Ovira AI Health Report", 20, 28);

    yPos = 55;

    // Report Info
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Generated: ${format(report.generatedAt, "MMMM d, yyyy")}`, 20, yPos);
    yPos += 7;
    doc.text(`Period: ${format(report.startDate, "MMM d")} - ${format(report.endDate, "MMM d, yyyy")}`, 20, yPos);
    yPos += 15;

    // Cycle Overview Section
    doc.setFillColor(245, 243, 255); // Lavender 50
    doc.rect(15, yPos - 5, pageWidth - 30, 35, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Cycle Overview", 20, yPos + 5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    yPos += 15;
    doc.text(`Average Cycle Length: ${report.cycleData.averageLength} days`, 25, yPos);
    yPos += 7;
    doc.text(`Period Days Logged: ${report.cycleData.periodDays} days`, 25, yPos);
    yPos += 20;

    // Symptom Summary Section
    doc.setFillColor(240, 253, 250); // Teal 50
    doc.rect(15, yPos - 5, pageWidth - 30, 45, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("Symptom Summary", 20, yPos + 5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    yPos += 15;
    doc.text(`Average Pain Level: ${report.symptoms.averagePain}/10`, 25, yPos);
    yPos += 7;
    doc.text(`Average Energy Level: ${report.symptoms.averageEnergy}/10`, 25, yPos);
    yPos += 7;
    doc.text(`Average Sleep: ${report.symptoms.averageSleep} hours/night`, 25, yPos);
    yPos += 7;
    doc.text(`Common Moods: ${report.symptoms.commonMoods.join(", ") || "N/A"}`, 25, yPos);
    yPos += 20;

    // Risk Assessment Section
    const riskColor: [number, number, number] =
        report.risks.level === "high"
            ? [239, 68, 68]
            : report.risks.level === "medium"
                ? [245, 158, 11]
                : [20, 184, 166];

    doc.setFillColor(254, 242, 242); // Red 50
    if (report.risks.level === "medium") {
        doc.setFillColor(255, 251, 235); // Amber 50
    } else if (report.risks.level === "low") {
        doc.setFillColor(240, 253, 250); // Teal 50
    }

    const riskHeight = 30 + (report.risks.flags.length * 7);
    doc.rect(15, yPos - 5, pageWidth - 30, riskHeight, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...riskColor);
    doc.text("Health Risk Assessment", 20, yPos + 5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    yPos += 15;
    doc.text(`Risk Level: ${report.risks.level.toUpperCase()}`, 25, yPos);
    yPos += 10;

    if (report.risks.flags.length > 0) {
        doc.setFontSize(10);
        report.risks.flags.forEach((flag) => {
            const lines = doc.splitTextToSize(`• ${flag}`, pageWidth - 50);
            lines.forEach((line: string) => {
                doc.text(line, 25, yPos);
                yPos += 6;
            });
        });
    } else {
        doc.text("No significant risk factors identified.", 25, yPos);
        yPos += 7;
    }
    yPos += 15;

    // Symptom Log Table
    if (logs.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("Symptom Log Details", 20, yPos);
        yPos += 10;

        const tableData = logs.slice(0, 15).map((log) => [
            format(new Date(log.date), "MMM d"),
            log.flowLevel,
            `${log.painScale}/10`,
            log.mood,
            `${log.energyLevel}/10`,
            `${log.sleepHours}h`,
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [["Date", "Flow", "Pain", "Mood", "Energy", "Sleep"]],
            body: tableData,
            theme: "striped",
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold",
            },
            bodyStyles: {
                fontSize: 9,
                textColor: textColor,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            margin: { left: 20, right: 20 },
        });
    }

    // Doctor Notes Section (on new page if needed)
    doc.addPage();
    yPos = 20;

    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Doctor's Notes", 20, 20);

    yPos = 45;

    // Notes lines
    doc.setDrawColor(...lightGray);
    for (let i = 0; i < 15; i++) {
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 15;
    }

    // Footer with disclaimer
    yPos = doc.internal.pageSize.getHeight() - 30;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, yPos - 10, pageWidth, 40, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...lightGray);
    const disclaimer = "DISCLAIMER: This report is generated by Ovira AI for informational purposes only. It is not a medical diagnosis. Please consult a qualified healthcare provider for medical advice, diagnosis, or treatment.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    disclaimerLines.forEach((line: string, index: number) => {
        doc.text(line, 20, yPos + (index * 5));
    });

    // Return as blob
    return doc.output("blob");
}
