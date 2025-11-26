-- Migration: Añadir trigger para registrar impacto ambiental al completar un Intercambio
-- Fecha: 2025-11-25
-- Descripción: Crea la función fn_registrar_impacto_intercambio() y el trigger
-- tr_registrar_impacto_intercambio que inserta un registro en Reportes_Impacto
-- cuando un Intercambio cambia a estado 'completado'.

-- Nota sobre la fórmula (puedes ajustarla):
--  - Se calcula el impacto en base al peso de la unidad de la publicación
--    multiplicado por la cantidad del intercambio: total_weight = peso_unidad * cantidad
--  - Los factores por categoría se buscan en la tabla Factor_Equivalencia (co2xkg,
--    energiaxkwh, aguaxlitro) vinculada a Equivalencia_Ecologica.categoria_id.
--  - Si no hay factor definido, se aplican valores por defecto (conservadores):
--      co2_per_kg = 0.5 (kg CO2 por kg de producto)
--      energy_per_kg = 0.1 (kWh por kg de producto)
--      water_per_kg = 2   (litros por kg de producto)
--  - Resultado final insertado en Reportes_Impacto: co2, energia_ahorrada, agua_preservada

-- Drop trigger first (depends on function), then drop function
DROP TRIGGER IF EXISTS tr_registrar_impacto_intercambio ON "Intercambio";
DROP FUNCTION IF EXISTS fn_registrar_impacto_intercambio();

CREATE OR REPLACE FUNCTION fn_registrar_impacto_intercambio()
RETURNS TRIGGER AS $$
DECLARE
  pub RECORD;
  eq RECORD;
  factor RECORD;
  total_weight NUMERIC := 0;
  co2_val NUMERIC := 0;
  energy_val NUMERIC := 0;
  water_val NUMERIC := 0;
  co2_per_kg NUMERIC := 0.5;    -- default
  energy_per_kg NUMERIC := 0.1; -- default
  water_per_kg NUMERIC := 2;    -- default
BEGIN
  -- Solo registrar cuando el estado cambie a 'completado'
  IF TG_OP = 'UPDATE' AND NEW.estado = 'completado' THEN

    -- Obtener publicación asociada
    SELECT * INTO pub FROM "Publicacion" WHERE id_publicacion = NEW.publicacion_id LIMIT 1;
    IF NOT FOUND THEN
      RAISE NOTICE 'fn_registrar_impacto_intercambio: Publicacion % no encontrada', NEW.publicacion_id;
      RETURN NEW;
    END IF;

    -- Intentar obtener la equivalencia ecológica a partir de la categoría
    SELECT * INTO eq FROM "Equivalencia_Ecologica" WHERE categoria_id = pub.categoria_id LIMIT 1;

    -- Obtener factores si existen
    IF FOUND THEN
      SELECT * INTO factor FROM "Factor_Equivalencia" WHERE equivalencia_id = eq.id_equivalencia LIMIT 1;
      IF FOUND THEN
        co2_per_kg := COALESCE(factor.co2xkg, co2_per_kg);
        energy_per_kg := COALESCE(factor.energiaxkwh, energy_per_kg);
        water_per_kg := COALESCE(factor.aguaxlitro, water_per_kg);
      END IF;
    END IF;

    -- Calcular peso total (peso_unidad * cantidad)
    total_weight := COALESCE(pub.peso_unidad, 0) * COALESCE(NEW.cantidad, 1);

    -- Calcular impactos
    co2_val := total_weight * co2_per_kg;
    energy_val := total_weight * energy_per_kg;
    water_val := total_weight * water_per_kg;

    -- Insertar en Reportes_Impacto (se registra el usuario que inició el intercambio)
    INSERT INTO "Reportes_Impacto" (id_usuario, co2, energia_ahorrada, agua_preservada, fecha_registro, publicacion_id)
    VALUES (NEW.usuario_id, co2_val, energy_val, water_val, NOW(), NEW.publicacion_id);

    -- Registro opcional en logs
    RAISE NOTICE 'Impacto registrado: pub=%, user=% -> CO2=%, ENERGY=%, WATER=%', NEW.publicacion_id, NEW.usuario_id, co2_val, energy_val, water_val;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que llame a la función cuando un intercambio cambia a completado
CREATE TRIGGER tr_registrar_impacto_intercambio
AFTER UPDATE OF estado ON "Intercambio"
FOR EACH ROW
WHEN (NEW.estado = 'completado')
EXECUTE FUNCTION fn_registrar_impacto_intercambio();

-- Fin de migración
