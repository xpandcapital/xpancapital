-- Corregir senderId rotos en email_templates apuntando al remitente is_default
-- Los IDs 2defa5c3... y 4e91ae9e... no existen en email_senders

UPDATE email_templates
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{senderId}',
  '"f5de0db6-3843-4b47-a102-6e50f13f37e6"'::jsonb
)
WHERE settings->>'senderId' IN (
  '2defa5c3-c530-4021-944f-82439807db2e',
  '4e91ae9e-5fa0-4f0b-9dd1-b4dd6b42d05e'
);
