-- ===========================================
-- PRD-04: Mapa Interativo
-- ===========================================

-- 1. Adicionar campos de localização a restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS coverage_radius_km DOUBLE PRECISION NOT NULL DEFAULT 2.0;

-- 2. Index espacial simplificado (sem PostGIS para manter simplicidade)
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Habilitar Realtime para restaurants (opcional, mas útil para o mapa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'restaurants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
  END IF;
END $$;
