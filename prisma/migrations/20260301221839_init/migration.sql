-- CreateEnum
CREATE TYPE "CycleState" AS ENUM ('Draft', 'Planning', 'Evaluation', 'Synthesis', 'Review', 'VendorReview', 'Publication', 'Completed', 'Suspended', 'Cancelled');

-- CreateEnum
CREATE TYPE "ScoreState" AS ENUM ('Draft', 'Reviewed', 'Published', 'Corrected');

-- CreateEnum
CREATE TYPE "ConfidenceTag" AS ENUM ('High', 'Medium', 'Low', 'InsufficientData');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('Success', 'Failed', 'Timeout');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('Screenshot', 'URL', 'Document', 'Video');

-- CreateEnum
CREATE TYPE "DisclosureStatus" AS ENUM ('Requested', 'Submitted', 'Reviewed', 'Incorporated', 'Expired');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('Pending', 'InReview', 'Completed', 'Expired');

-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('Gold', 'Silver', 'Bronze');

-- CreateTable
CREATE TABLE "benchmark_cycles" (
    "id" TEXT NOT NULL,
    "cycle_identifier" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "state" "CycleState" NOT NULL DEFAULT 'Draft',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "methodology_version_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "suspended_at" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmark_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_track_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmark_track_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_tool_enrollments" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "withdrawal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_tool_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_reports" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "executive_summary" TEXT,
    "content" JSONB,
    "published_at" TIMESTAMP(3),
    "seo_title" TEXT,
    "seo_description" TEXT,
    "structured_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benchmark_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_audit_packages" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "integrity_hash" TEXT NOT NULL,
    "is_sealed" BOOLEAN NOT NULL DEFAULT false,
    "sealed_at" TIMESTAMP(3),
    "file_url" TEXT,
    "file_size_bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_audit_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website_url" TEXT,
    "logo_url" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website_url" TEXT NOT NULL,
    "logo_url" TEXT,
    "vendor_id" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_track_mappings" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_track_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_segment_mappings" (
    "id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_segment_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "methodology_versions" (
    "id" TEXT NOT NULL,
    "version_number" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "methodology_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_dimensions" (
    "id" TEXT NOT NULL,
    "methodology_version_id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "weight" DECIMAL(5,4) NOT NULL,
    "category" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_sets" (
    "id" TEXT NOT NULL,
    "methodology_version_id" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompts" JSONB NOT NULL,
    "is_rotating" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model_identifier" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "timeout_ms" INTEGER NOT NULL DEFAULT 30000,
    "api_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_evaluations" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "prompt_set_id" TEXT NOT NULL,
    "raw_response" TEXT NOT NULL,
    "parsed_score" DECIMAL(3,1),
    "response_time_ms" INTEGER NOT NULL,
    "status" "EvaluationStatus" NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "evaluated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_artifacts" (
    "id" TEXT NOT NULL,
    "model_evaluation_id" TEXT NOT NULL,
    "artifact_type" "ArtifactType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synthesis_records" (
    "id" TEXT NOT NULL,
    "score_id" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "models_succeeded" INTEGER NOT NULL,
    "models_failed" INTEGER NOT NULL,
    "median_value" DECIMAL(3,1) NOT NULL,
    "agreement_metric" DECIMAL(5,4) NOT NULL,
    "confidence_tag" "ConfidenceTag" NOT NULL,
    "source_model_ids" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synthesis_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "value" DECIMAL(3,1) NOT NULL,
    "confidence_tag" "ConfidenceTag" NOT NULL,
    "is_applicable" BOOLEAN NOT NULL DEFAULT true,
    "state" "ScoreState" NOT NULL DEFAULT 'Draft',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_corrections" (
    "id" TEXT NOT NULL,
    "score_id" TEXT NOT NULL,
    "previous_value" DECIMAL(3,1) NOT NULL,
    "corrected_value" DECIMAL(3,1) NOT NULL,
    "reason" TEXT NOT NULL,
    "corrected_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composite_scores" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "segment_id" TEXT,
    "value" DECIMAL(3,1) NOT NULL,
    "rank" INTEGER NOT NULL,
    "confidence_tag" "ConfidenceTag" NOT NULL,
    "state" "ScoreState" NOT NULL DEFAULT 'Draft',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "adjusted_by" TEXT,
    "adjusted_at" TIMESTAMP(3),
    "adjust_reason" TEXT,
    "original_value" DECIMAL(3,1),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "composite_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "composite_score_id" TEXT,
    "tier" "BadgeTier" NOT NULL,
    "badge_type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_disclosures" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "tool_id" TEXT,
    "status" "DisclosureStatus" NOT NULL DEFAULT 'Requested',
    "disclosure_type" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "content" TEXT,
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_disclosures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_reviews" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'Pending',
    "window_opens_at" TIMESTAMP(3) NOT NULL,
    "window_closes_at" TIMESTAMP(3) NOT NULL,
    "access_token" TEXT,
    "corrections" JSONB,
    "operator_notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "block_type" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_cycles_cycle_identifier_key" ON "benchmark_cycles"("cycle_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_track_definitions_name_key" ON "benchmark_track_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_track_definitions_slug_key" ON "benchmark_track_definitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_tool_enrollments_cycle_id_tool_id_key" ON "cycle_tool_enrollments"("cycle_id", "tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_reports_cycle_id_key" ON "benchmark_reports"("cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_reports_slug_key" ON "benchmark_reports"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_audit_packages_cycle_id_key" ON "cycle_audit_packages"("cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tools_slug_key" ON "tools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tool_track_mappings_tool_id_track_id_key" ON "tool_track_mappings"("tool_id", "track_id");

-- CreateIndex
CREATE UNIQUE INDEX "tool_segment_mappings_tool_id_segment_id_key" ON "tool_segment_mappings"("tool_id", "segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "market_segments_name_key" ON "market_segments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "market_segments_slug_key" ON "market_segments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "methodology_versions_version_number_key" ON "methodology_versions"("version_number");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_dimensions_methodology_version_id_slug_key" ON "scoring_dimensions"("methodology_version_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_sets_methodology_version_id_dimension_id_version_key" ON "prompt_sets"("methodology_version_id", "dimension_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_model_identifier_key" ON "ai_models"("model_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "synthesis_records_score_id_key" ON "synthesis_records"("score_id");

-- CreateIndex
CREATE UNIQUE INDEX "scores_cycle_id_tool_id_dimension_id_key" ON "scores"("cycle_id", "tool_id", "dimension_id");

-- CreateIndex
CREATE UNIQUE INDEX "composite_scores_cycle_id_tool_id_segment_id_key" ON "composite_scores"("cycle_id", "tool_id", "segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_cycle_id_tool_id_badge_type_key" ON "badges"("cycle_id", "tool_id", "badge_type");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_reviews_access_token_key" ON "vendor_reviews"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_reviews_cycle_id_vendor_id_key" ON "vendor_reviews"("cycle_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_slug_key" ON "content_blocks"("slug");

-- AddForeignKey
ALTER TABLE "benchmark_cycles" ADD CONSTRAINT "benchmark_cycles_methodology_version_id_fkey" FOREIGN KEY ("methodology_version_id") REFERENCES "methodology_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_tool_enrollments" ADD CONSTRAINT "cycle_tool_enrollments_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_tool_enrollments" ADD CONSTRAINT "cycle_tool_enrollments_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_reports" ADD CONSTRAINT "benchmark_reports_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_audit_packages" ADD CONSTRAINT "cycle_audit_packages_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_track_mappings" ADD CONSTRAINT "tool_track_mappings_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_track_mappings" ADD CONSTRAINT "tool_track_mappings_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "benchmark_track_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_segment_mappings" ADD CONSTRAINT "tool_segment_mappings_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_segment_mappings" ADD CONSTRAINT "tool_segment_mappings_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "market_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_dimensions" ADD CONSTRAINT "scoring_dimensions_methodology_version_id_fkey" FOREIGN KEY ("methodology_version_id") REFERENCES "methodology_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_dimensions" ADD CONSTRAINT "scoring_dimensions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "benchmark_track_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_sets" ADD CONSTRAINT "prompt_sets_methodology_version_id_fkey" FOREIGN KEY ("methodology_version_id") REFERENCES "methodology_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_sets" ADD CONSTRAINT "prompt_sets_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "scoring_dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_evaluations" ADD CONSTRAINT "model_evaluations_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_evaluations" ADD CONSTRAINT "model_evaluations_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_evaluations" ADD CONSTRAINT "model_evaluations_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "scoring_dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_evaluations" ADD CONSTRAINT "model_evaluations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_evaluations" ADD CONSTRAINT "model_evaluations_prompt_set_id_fkey" FOREIGN KEY ("prompt_set_id") REFERENCES "prompt_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_artifacts" ADD CONSTRAINT "evidence_artifacts_model_evaluation_id_fkey" FOREIGN KEY ("model_evaluation_id") REFERENCES "model_evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synthesis_records" ADD CONSTRAINT "synthesis_records_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "scores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synthesis_records" ADD CONSTRAINT "synthesis_records_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "scoring_dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "scoring_dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_corrections" ADD CONSTRAINT "score_corrections_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "scores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_scores" ADD CONSTRAINT "composite_scores_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_scores" ADD CONSTRAINT "composite_scores_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_scores" ADD CONSTRAINT "composite_scores_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "market_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_composite_score_id_fkey" FOREIGN KEY ("composite_score_id") REFERENCES "composite_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_disclosures" ADD CONSTRAINT "vendor_disclosures_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_disclosures" ADD CONSTRAINT "vendor_disclosures_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_disclosures" ADD CONSTRAINT "vendor_disclosures_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "benchmark_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reviews" ADD CONSTRAINT "vendor_reviews_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
