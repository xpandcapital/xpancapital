-- Migración: 105_profiles_social_bio.sql
-- Agrega biografía y redes sociales al perfil del usuario

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biografia TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
