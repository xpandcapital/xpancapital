-- 104_rename_blis_coins_to_xpand_coins.sql
-- Renombrar blis_coins a xpand_coins en profiles

ALTER TABLE profiles RENAME COLUMN blis_coins TO xpand_coins;
