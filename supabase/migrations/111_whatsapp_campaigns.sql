-- Migración: 111_whatsapp_campaigns.sql
-- Campañas masivas de WhatsApp + campo whatsapp en profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  campana_id UUID REFERENCES campanas(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  mensajes TEXT[] NOT NULL DEFAULT '{}',
  variables JSONB DEFAULT '{}',
  media_url TEXT,
  filename TEXT,
  lead_filter JSONB DEFAULT '{}',
  min_delay_seconds INTEGER DEFAULT 60,
  max_delay_seconds INTEGER DEFAULT 180,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','completed','paused')),
  scheduled_for TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','read','failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error TEXT
);
