import { randomBytes } from "crypto";
import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  sendReviewWindowOpenedEmail,
  sendCorrectionAcceptedEmail,
  sendCorrectionRejectedEmail,
} from "@/lib/email/vendor-review-emails";

/**
 * Open vendor review window for a cycle.
 * AC-015-01: Triggered when cycle enters VendorReview state.
 * Each vendor gets access to only their own tool's scores.
 */
export async function openReviewWindow(cycleId: string) {
  // Get all enrolled tools with their vendors
  const enrollments = await prisma.cycleToolEnrollment.findMany({
    where: { cycleId, withdrawnAt: null },
    include: {
      tool: { include: { vendor: true } },
    },
  });

  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
    select: { displayName: true },
  });

  const reviews = [];
  const windowOpensAt = new Date();
  const windowClosesAt = addBusinessDays(windowOpensAt, 5);

  for (const enrollment of enrollments) {
    if (!enrollment.tool.vendor) continue;

    const review = await prisma.vendorReview.upsert({
      where: {
        cycleId_vendorId: {
          cycleId,
          vendorId: enrollment.tool.vendor.id,
        },
      },
      update: {},
      create: {
        cycleId,
        vendorId: enrollment.tool.vendor.id,
        status: ReviewStatus.Pending,
        windowOpensAt,
        windowClosesAt,
        accessToken: randomBytes(32).toString("hex"),
      },
    });

    reviews.push(review);
  }

  // Send notification emails to vendors with contact emails
  const emailResults: { vendorId: string; success: boolean; error?: string }[] = [];
  for (const enrollment of enrollments) {
    const vendor = enrollment.tool.vendor;
    if (!vendor?.contactEmail) continue;

    const review = reviews.find((r) => r.vendorId === vendor.id);
    if (!review) continue;

    const result = await sendReviewWindowOpenedEmail(vendor, {
      ...review,
      cycle,
    });
    emailResults.push({ vendorId: vendor.id, ...result });
  }

  return { reviews, windowClosesAt, emailResults };
}

/**
 * Submit a vendor correction request.
 * AC-015-02: Vendors submit factual corrections with evidence.
 */
export async function submitCorrection(data: {
  vendorReviewId: string;
  dimensionId: string;
  currentValue: number;
  proposedValue: number;
  justification: string;
  evidenceUrls: string[];
}) {
  const review = await prisma.vendorReview.findUniqueOrThrow({
    where: { id: data.vendorReviewId },
  });

  if (review.status !== ReviewStatus.Pending) {
    throw new Error(`Cannot submit correction: review is in ${review.status} state`);
  }

  // Check if review window has expired
  if (new Date() > review.windowClosesAt) {
    throw new Error("Review window has expired");
  }

  // Store correction as JSON in the review's corrections field
  const existingCorrections = (review.corrections as Prisma.JsonArray) ?? [];
  const correction = {
    dimensionId: data.dimensionId,
    currentValue: data.currentValue,
    proposedValue: data.proposedValue,
    justification: data.justification,
    evidenceUrls: data.evidenceUrls,
    submittedAt: new Date().toISOString(),
  };

  return prisma.vendorReview.update({
    where: { id: data.vendorReviewId },
    data: {
      status: ReviewStatus.InReview,
      corrections: [...existingCorrections, correction] as Prisma.InputJsonValue,
    },
  });
}

/**
 * Operator accepts a correction.
 * AC-015-02: Triggers score adjustment with audit trail.
 * Status transitions to Completed with acceptance notes.
 */
export async function acceptCorrection(vendorReviewId: string, operatorNotes: string) {
  const review = await prisma.vendorReview.update({
    where: { id: vendorReviewId },
    data: {
      status: ReviewStatus.Completed,
      operatorNotes: `ACCEPTED: ${operatorNotes}`,
      completedAt: new Date(),
    },
    include: {
      vendor: true,
      cycle: { select: { displayName: true } },
    },
  });

  if (review.vendor.contactEmail) {
    await sendCorrectionAcceptedEmail(review.vendor, review);
  }

  return review;
}

/**
 * Operator rejects a correction.
 * AC-015-02: Documented reason required.
 * Status transitions to Completed with rejection reason.
 */
export async function rejectCorrection(vendorReviewId: string, operatorNotes: string) {
  if (!operatorNotes.trim()) {
    throw new Error("Rejection reason is required");
  }

  const review = await prisma.vendorReview.update({
    where: { id: vendorReviewId },
    data: {
      status: ReviewStatus.Completed,
      operatorNotes: `REJECTED: ${operatorNotes}`,
      completedAt: new Date(),
    },
    include: {
      vendor: true,
      cycle: { select: { displayName: true } },
    },
  });

  if (review.vendor.contactEmail) {
    await sendCorrectionRejectedEmail(review.vendor, review);
  }

  return review;
}

/**
 * Get all vendor reviews for a cycle.
 */
export async function getReviewsForCycle(cycleId: string) {
  return prisma.vendorReview.findMany({
    where: { cycleId },
    include: {
      vendor: true,
    },
    orderBy: { vendor: { companyName: "asc" } },
  });
}

/**
 * Check if review window is closed for all vendors.
 * Used to determine if cycle can proceed to Publication.
 */
export async function isReviewWindowClosed(cycleId: string): Promise<boolean> {
  const pendingReviews = await prisma.vendorReview.count({
    where: {
      cycleId,
      status: ReviewStatus.Pending,
    },
  });

  if (pendingReviews > 0) {
    // Check if all pending reviews have expired
    const unexpiredReviews = await prisma.vendorReview.count({
      where: {
        cycleId,
        status: ReviewStatus.Pending,
        windowClosesAt: { gt: new Date() },
      },
    });

    return unexpiredReviews === 0;
  }

  return true;
}

/**
 * Add N business days to a date (skip weekends).
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}
