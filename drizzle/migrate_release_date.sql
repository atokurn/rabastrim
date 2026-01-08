-- Data Migration: Backfill release fields for existing records
-- Run after schema migration to populate release_date, release_year, release_status

-- 1. Backfill release_year from year column
UPDATE contents 
SET release_year = year 
WHERE release_year IS NULL AND year IS NOT NULL;

-- 2. Set release_status = 'released' for records with year
UPDATE contents 
SET release_status = 'released' 
WHERE release_year IS NOT NULL AND release_status = 'unknown';

-- 3. Set release_status = 'unknown' for records without any release info
UPDATE contents 
SET release_status = 'unknown' 
WHERE release_year IS NULL AND release_status IS NULL;

-- Create index for performance (recommended for >5000 records)
CREATE INDEX IF NOT EXISTS idx_contents_release_date 
ON contents (release_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_contents_release_composite 
ON contents (COALESCE(release_date, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_contents_region 
ON contents (region);

CREATE INDEX IF NOT EXISTS idx_contents_content_type 
ON contents (content_type);

-- Verify results
SELECT 
    provider,
    release_status,
    COUNT(*) as count,
    MIN(release_year) as min_year,
    MAX(release_year) as max_year
FROM contents 
GROUP BY provider, release_status 
ORDER BY provider, release_status;
