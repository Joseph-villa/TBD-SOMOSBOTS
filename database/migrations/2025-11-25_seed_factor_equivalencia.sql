-- Migration: Semillas para Factor_Equivalencia (ejemplos por categoría)
-- Fecha: 2025-11-25
-- Inserta factores por categoría si existen equivalencias definidas
-- Evita duplicados comprobando existencia previa por equivalencia_id

-- ROPA
INSERT INTO "Factor_Equivalencia" (co2xkg, energiaxkwh, aguaxlitro, equivalencia_id)
SELECT 0.45, 0.09, 1.8, e.id_equivalencia
FROM "Equivalencia_Ecologica" e
JOIN categoria c ON c.id_categoria = e.categoria_id
WHERE c.nombre ILIKE 'Ropa'
  AND NOT EXISTS (
    SELECT 1 FROM "Factor_Equivalencia" fe WHERE fe.equivalencia_id = e.id_equivalencia
  );

-- ELECTRÓNICOS
INSERT INTO "Factor_Equivalencia" (co2xkg, energiaxkwh, aguaxlitro, equivalencia_id)
SELECT 1.2, 0.5, 5.0, e.id_equivalencia
FROM "Equivalencia_Ecologica" e
JOIN categoria c ON c.id_categoria = e.categoria_id
WHERE c.nombre ILIKE 'Electr%C3%B3nicos' OR c.nombre ILIKE 'Electrónicos' OR c.nombre ILIKE 'Electronicos'
  AND NOT EXISTS (
    SELECT 1 FROM "Factor_Equivalencia" fe WHERE fe.equivalencia_id = e.id_equivalencia
  );

-- SERVICIOS
INSERT INTO "Factor_Equivalencia" (co2xkg, energiaxkwh, aguaxlitro, equivalencia_id)
SELECT 0.2, 0.05, 0.5, e.id_equivalencia
FROM "Equivalencia_Ecologica" e
JOIN categoria c ON c.id_categoria = e.categoria_id
WHERE c.nombre ILIKE 'Servicios'
  AND NOT EXISTS (
    SELECT 1 FROM "Factor_Equivalencia" fe WHERE fe.equivalencia_id = e.id_equivalencia
  );

-- OTROS (fallback para categorías genéricas)
INSERT INTO "Factor_Equivalencia" (co2xkg, energiaxkwh, aguaxlitro, equivalencia_id)
SELECT 0.5, 0.1, 2.0, e.id_equivalencia
FROM "Equivalencia_Ecologica" e
JOIN categoria c ON c.id_categoria = e.categoria_id
WHERE c.nombre ILIKE 'Otros' OR c.nombre IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Factor_Equivalencia" fe WHERE fe.equivalencia_id = e.id_equivalencia
  );

-- Mensaje opcional: selecciona las filas insertadas (puedes ejecutar después para comprobar)
-- SELECT * FROM "Factor_Equivalencia" ORDER BY id_factor_eq DESC LIMIT 10;
