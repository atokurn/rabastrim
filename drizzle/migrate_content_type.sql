-- Data Migration: Set content_type and region for existing records
-- Run this after the schema migration to update existing data

-- 1. Set content_type = 'short_drama' for short drama providers
UPDATE contents 
SET content_type = 'short_drama' 
WHERE provider IN ('dramabox', 'flickreels', 'melolo')
AND content_type IS NULL;

-- 2. Set region = 'CN' for DramaBox (Chinese content)
UPDATE contents 
SET region = 'CN' 
WHERE provider = 'dramabox' 
AND region IS NULL;

-- 3. Set region = 'ID' for Melolo (Indonesian content)
UPDATE contents 
SET region = 'ID' 
WHERE provider = 'melolo' 
AND region IS NULL;

-- 4. Set content_type = 'anime' for DramaQueen donghua
UPDATE contents 
SET content_type = 'anime' 
WHERE provider = 'dramaqueen' 
AND tags LIKE '%donghua%';

-- 5. Set content_type = 'drama' for other DramaQueen content
UPDATE contents 
SET content_type = 'drama' 
WHERE provider = 'dramaqueen' 
AND content_type IS NULL;

-- 6. Set region = 'CN' for DramaQueen without region (fallback)
UPDATE contents 
SET region = 'CN' 
WHERE provider = 'dramaqueen' 
AND region IS NULL;

-- Verify results
SELECT provider, content_type, region, COUNT(*) as count 
FROM contents 
GROUP BY provider, content_type, region 
ORDER BY provider, content_type, region;
