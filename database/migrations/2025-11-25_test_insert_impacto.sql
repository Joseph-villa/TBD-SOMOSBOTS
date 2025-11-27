-- Test: Crear publicación + intercambio y forzar completado (dispara trigger)
-- Fecha: 2025-11-25
-- Este script realiza lo siguiente:
-- 1) Busca un usuario y una categoría (Ropa) en la DB
-- 2) Inserta una publicación de prueba con peso_unidad = 2.5 kg
-- 3) Inserta un intercambio apuntando a la publicación
-- 4) Actualiza el intercambio a estado 'completado' (dispara el trigger)
-- 5) Muestra (RAISE NOTICE) los registros insertados en Reportes_Impacto

DO $$
DECLARE
  pub_id INTEGER;
  usr_id INTEGER;
  cat_id INTEGER;
  exch_id INTEGER;
  rec RECORD;
BEGIN
  -- Obtener un usuario de prueba
  SELECT id_usuario INTO usr_id FROM "Usuario" LIMIT 1;
  IF usr_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en la tabla "Usuario". Crea al menos uno antes de correr la prueba.';
  END IF;

  -- Buscar categoría Ropa (fallback a la primera categoría si no existe Ropa)
  SELECT id_categoria INTO cat_id FROM "Categoria" WHERE nombre ILIKE 'Ropa' LIMIT 1;
  IF cat_id IS NULL THEN
    SELECT id_categoria INTO cat_id FROM "Categoria" LIMIT 1;
    IF cat_id IS NULL THEN
      RAISE EXCEPTION 'No hay categorías en la tabla "Categoria". Crea al menos una antes de correr la prueba.';
    END IF;
  END IF;

  -- Insertar publicación de prueba
  INSERT INTO "Publicacion" (titulo, precio, campo, existencias, peso_unidad, descripcion, estado, usuario_id, categoria_id)
  VALUES ('Prueba Impacto Auto ' || now(), 10.00, 'unidad', 1, 2.5, 'Publicación de prueba automática', 'Activo', usr_id, cat_id)
  RETURNING id_publicacion INTO pub_id;

  RAISE NOTICE 'Publicacion creada id=%', pub_id;

  -- Insertar intercambio de prueba (misma persona como iniciador para simplificar)
  INSERT INTO "Intercambio" (creditos_verdes, cantidad, estado, usuario_id, publicacion_id)
  VALUES (5, 2, 'en_proceso', usr_id, pub_id)
  RETURNING id_intercambio INTO exch_id;

  RAISE NOTICE 'Intercambio creado id=%', exch_id;

  -- Actualizar a completado -> esto debe disparar el trigger que inserta en Reportes_Impacto
  UPDATE "Intercambio" SET estado = 'completado' WHERE id_intercambio = exch_id;

  RAISE NOTICE 'Intercambio % marcado como completado (trigger debería haber corrido).', exch_id;

  -- Mostrar los últimos registros de Reportes_Impacto relacionados con la publicación
  FOR rec IN SELECT id_reporte, id_usuario, co2, energia_ahorrada, agua_preservada, fecha_registro
             FROM "Reportes_Impacto"
             WHERE publicacion_id = pub_id
             ORDER BY fecha_registro DESC
             LIMIT 5
  LOOP
    RAISE NOTICE 'REPORT: id=% user=% co2=% energy=% water=% at %', rec.id_reporte, rec.id_usuario, rec.co2, rec.energia_ahorrada, rec.agua_preservada, rec.fecha_registro;
  END LOOP;

END$$;

-- Nota: Si deseas eliminar los datos de prueba, ejecuta:
-- DELETE FROM "Intercambio" WHERE publicacion_id IN (SELECT id_publicacion FROM "Publicacion" WHERE titulo ILIKE 'Prueba Impacto Auto %');
-- DELETE FROM "Publicacion" WHERE titulo ILIKE 'Prueba Impacto Auto %';
-- DELETE FROM "Reportes_Impacto" WHERE publicacion_id IS NULL OR fecha_registro > now() - INTERVAL '1 hour'; -- ajustar según sea necesario
