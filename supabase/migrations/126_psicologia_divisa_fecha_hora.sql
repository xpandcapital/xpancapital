-- Agrega columnas para divisa, fecha y hora de análisis en evaluaciones psicológicas
ALTER TABLE evaluacion_psicologica ADD COLUMN IF NOT EXISTS divisa text;
ALTER TABLE evaluacion_psicologica ADD COLUMN IF NOT EXISTS fecha_analisis date;
ALTER TABLE evaluacion_psicologica ADD COLUMN IF NOT EXISTS hora_analisis time;
