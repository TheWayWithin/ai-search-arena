import { ArtifactType } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * R2 upload configuration.
 * Uses S3-compatible API with Cloudflare R2.
 */
function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME ?? "aisearcharena-evidence";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null; // R2 not configured — graceful degradation
  }

  return {
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

/**
 * Upload an evidence artifact to Cloudflare R2.
 * AC-018-01: Creates EvidenceArtifact with artifact_type, file_url, description.
 *
 * Falls back gracefully if R2 is unavailable — queues for later upload.
 */
export async function uploadEvidence(data: {
  modelEvaluationId: string;
  artifactType: ArtifactType;
  description: string;
  fileName: string;
  fileContent: Blob;
  mimeType: string;
}): Promise<{
  id: string;
  fileUrl: string | null;
  queued: boolean;
}> {
  const r2 = getR2Config();

  let fileUrl: string | null = null;
  let queued = false;

  if (r2) {
    try {
      const key = `evidence/${data.modelEvaluationId}/${data.fileName}`;
      const uploadUrl = `${r2.endpoint}/${r2.bucketName}/${key}`;

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": data.mimeType,
        },
        body: data.fileContent,
      });

      if (response.ok) {
        fileUrl = `https://${r2.bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
      } else {
        queued = true;
      }
    } catch {
      queued = true;
    }
  } else {
    queued = true;
  }

  // Create evidence record regardless of upload status
  const evidence = await prisma.evidenceArtifact.create({
    data: {
      modelEvaluationId: data.modelEvaluationId,
      artifactType: data.artifactType,
      fileUrl: fileUrl ?? `pending://${data.fileName}`,
      description: data.description,
      capturedAt: new Date(),
    },
  });

  return {
    id: evidence.id,
    fileUrl,
    queued,
  };
}

/**
 * Get evidence artifacts for a model evaluation.
 */
export async function getEvidenceForEvaluation(modelEvaluationId: string) {
  return prisma.evidenceArtifact.findMany({
    where: { modelEvaluationId },
    orderBy: { capturedAt: "desc" },
  });
}

/**
 * Get all evidence artifacts for a tool within a cycle.
 * AC-018-03: Evidence links accessible from published tool detail pages.
 */
export async function getEvidenceForToolInCycle(cycleId: string, toolId: string) {
  return prisma.evidenceArtifact.findMany({
    where: {
      modelEvaluation: {
        cycleId,
        toolId,
      },
    },
    include: {
      modelEvaluation: {
        include: {
          dimension: true,
          model: true,
        },
      },
    },
    orderBy: { capturedAt: "desc" },
  });
}

/**
 * Check if all applicable dimensions have evidence for a tool evaluation.
 * AC-018-02: Score Draft->Reviewed blocked if applicable dimensions lack evidence.
 */
export async function checkEvidenceCompleteness(
  cycleId: string,
  toolId: string
): Promise<{
  complete: boolean;
  totalDimensions: number;
  dimensionsWithEvidence: number;
  missingDimensions: string[];
}> {
  const evaluations = await prisma.modelEvaluation.findMany({
    where: {
      cycleId,
      toolId,
      status: "Success",
    },
    include: {
      dimension: true,
      evidence: true,
    },
  });

  const dimensionMap = new Map<string, { name: string; hasEvidence: boolean }>();
  for (const eval_ of evaluations) {
    if (!dimensionMap.has(eval_.dimensionId)) {
      dimensionMap.set(eval_.dimensionId, {
        name: eval_.dimension.name,
        hasEvidence: eval_.evidence.length > 0,
      });
    } else if (eval_.evidence.length > 0) {
      dimensionMap.get(eval_.dimensionId)!.hasEvidence = true;
    }
  }

  const totalDimensions = dimensionMap.size;
  const dimensionsWithEvidence = [...dimensionMap.values()].filter((d) => d.hasEvidence).length;
  const missingDimensions = [...dimensionMap.values()]
    .filter((d) => !d.hasEvidence)
    .map((d) => d.name);

  return {
    complete: missingDimensions.length === 0,
    totalDimensions,
    dimensionsWithEvidence,
    missingDimensions,
  };
}
