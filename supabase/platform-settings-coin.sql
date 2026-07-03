-- Seed coin platform settings (safe to re-run).

INSERT INTO platform_settings (key, value)
VALUES
  ('default_coin_value', '1'),
  ('default_enrollment_coin_count', '1'),
  ('default_streak_days', '7'),
  ('default_streak_coin_count', '5')
ON CONFLICT (key) DO NOTHING;

-- Migrate legacy streak count key if present
UPDATE platform_settings
SET key = 'default_streak_coin_count'
WHERE key = 'default_streak_count'
  AND NOT EXISTS (
    SELECT 1 FROM platform_settings WHERE key = 'default_streak_coin_count'
  );
