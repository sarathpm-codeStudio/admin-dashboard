-- Backfill faculty commission_rate with platform default where NULL.

UPDATE profiles p
SET commission_rate = (
  SELECT value::numeric
  FROM platform_settings
  WHERE key = 'default_commission_percent'
  LIMIT 1
)
WHERE p.role = 'FACULTY'
  AND p.commission_rate IS NULL;

COMMENT ON COLUMN profiles.commission_rate IS
  'Platform commission % for this faculty. Equal to default_commission_percent = follows default; different = custom override.';
