CREATE TABLE IF NOT EXISTS "VideoStudioSourceSet" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
  "schemaVersion" VARCHAR(48) NOT NULL,
  "manifestDigest" VARCHAR(64) NOT NULL,
  "snapshotDigest" VARCHAR(64) NOT NULL,
  "sourceReferenceId" VARCHAR(120) NOT NULL UNIQUE,
  "assetCount" INTEGER NOT NULL,
  "entries" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoStudioSourceSet_assetCount_check" CHECK ("assetCount" >= 2 AND "assetCount" <= 120),
  CONSTRAINT "VideoStudioSourceSet_manifestDigest_check" CHECK ("manifestDigest" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "VideoStudioSourceSet_snapshotDigest_check" CHECK ("snapshotDigest" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "VideoStudioSourceSet_sourceReferenceId_check" CHECK (char_length("sourceReferenceId") <= 120)
);

CREATE UNIQUE INDEX IF NOT EXISTS "VideoStudioSourceSet_jobId_manifestDigest_key"
  ON "VideoStudioSourceSet"("jobId", "manifestDigest");
CREATE UNIQUE INDEX IF NOT EXISTS "VideoStudioSourceSet_id_jobId_key"
  ON "VideoStudioSourceSet"("id", "jobId");
CREATE INDEX IF NOT EXISTS "VideoStudioSourceSet_jobId_createdAt_idx"
  ON "VideoStudioSourceSet"("jobId", "createdAt");

ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "activeVideoStudioSourceSetId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Job_activeVideoStudioSourceSetId_key"
  ON "Job"("activeVideoStudioSourceSetId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Job_activeVideoStudioSourceSetId_fkey'
  ) THEN
    ALTER TABLE "Job"
      ADD CONSTRAINT "Job_activeVideoStudioSourceSetId_fkey"
      FOREIGN KEY ("activeVideoStudioSourceSetId")
      REFERENCES "VideoStudioSourceSet"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Job_activeVideoStudioSourceSetId_owner_fkey'
  ) THEN
    ALTER TABLE "Job"
      ADD CONSTRAINT "Job_activeVideoStudioSourceSetId_owner_fkey"
      FOREIGN KEY ("activeVideoStudioSourceSetId", "id")
      REFERENCES "VideoStudioSourceSet"("id", "jobId")
      ON DELETE RESTRICT;
  END IF;
END $$;
