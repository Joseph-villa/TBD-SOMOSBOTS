CREATE TABLE "Rol" (
  "rol_id" int PRIMARY KEY,
  "nombre_rol" varchar,
  "descripcion" text
);

CREATE TABLE "Usuario" (
  "usuario_id" int PRIMARY KEY,
  "nombre" varchar,
  "correo" varchar UNIQUE,
  "contrasena" varchar,
  "estado" boolean,
  "billetera_id" int,
  "rol_id" int
);

CREATE TABLE "Billetera" (
  "billetera_id" int PRIMARY KEY,
  "saldo_actual" decimal,
  "saldo_retenido" decimal,
  "fecha_ultima_actualizacion" datetime
);

CREATE TABLE "Puntos" (
  "puntos_id" int PRIMARY KEY,
  "total_adquirido" int,
  "total_actual" int,
  "total_utilizado" int,
  "usuario_id" int,
  "billetera_id" int
);

CREATE TABLE "Categoria" (
  "categoria_id" int PRIMARY KEY,
  "nombre" varchar,
  "descripcion" text
);

CREATE TABLE "Publicacion" (
  "publicacion_id" int PRIMARY KEY,
  "titulo" varchar,
  "descripcion" text,
  "valor_creditos" int,
  "campo" varchar,
  "foto" varchar,
  "categoria_id" int,
  "usuario_id" int
);

CREATE TABLE "IndicadorImpacto" (
  "indicador_id" int PRIMARY KEY,
  "tipo_indicador" varchar,
  "unidad" varchar,
  "valor_estimado" decimal,
  "descripcion" text,
  "publicacion_id" int
);

CREATE TABLE "Intercambio" (
  "intercambio_id" int PRIMARY KEY,
  "creditos_verdes" int,
  "cantidad" int,
  "estado" varchar,
  "fecha_creacion" datetime,
  "fecha_cierre" datetime,
  "publicacion_id" int,
  "usuario_id" int
);

CREATE TABLE "Custodia_Creditos" (
  "custodia_id" int PRIMARY KEY,
  "comprador_id" int,
  "oferente_id" int,
  "monto" decimal,
  "estado" varchar,
  "fecha_retenido" datetime,
  "fecha_liberacion" datetime,
  "billetera_comprador" int,
  "billetera_vendedor" int,
  "intercambio_id" int
);

CREATE TABLE "Movimiento_Credito" (
  "movimiento_id" int PRIMARY KEY,
  "tipo_movimiento" varchar,
  "monto" decimal,
  "origen" varchar,
  "fecha_mov" datetime,
  "descripcion" text,
  "billetera_id" int
);

CREATE TABLE "Paquete_Recarga" (
  "paquete_id" int PRIMARY KEY,
  "nombre_paquete" varchar,
  "puntos" int,
  "costo" decimal
);

CREATE TABLE "Transaccion" (
  "transaccion_id" int PRIMARY KEY,
  "fechaTrans" datetime,
  "cantPtsTran" int,
  "tipoTransac" varchar,
  "puntos_id" int,
  "paquete_id" in
);

CREATE TABLE "Mision" (
  "mision_id" int PRIMARY KEY,
  "objetivo" varchar,
  "descripcion" text,
  "puntos_obtenidos" int
);

CREATE TABLE "Progreso_Mision" (
  "usuario_id" int,
  "mision_id" int,
  "fechaCumplida" datetime,
  PRIMARY KEY ("usuario_id", "mision_id")
);

CREATE TABLE "Mensaje" (
  "mensaje_id" int PRIMARY KEY,
  "contenido" text,
  "fecha_envio" datetime,
  "estado" varchar,
  "remitente_id" int,
  "destinatario_id" int
);

ALTER TABLE "Usuario" ADD FOREIGN KEY ("billetera_id") REFERENCES "Billetera" ("billetera_id");

ALTER TABLE "Usuario" ADD FOREIGN KEY ("rol_id") REFERENCES "Rol" ("rol_id");

ALTER TABLE "Puntos" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Puntos" ADD FOREIGN KEY ("billetera_id") REFERENCES "Billetera" ("billetera_id");

ALTER TABLE "Publicacion" ADD FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("categoria_id");

ALTER TABLE "Publicacion" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "IndicadorImpacto" ADD FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion" ("publicacion_id");

ALTER TABLE "Intercambio" ADD FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion" ("publicacion_id");

ALTER TABLE "Intercambio" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Custodia_Creditos" ADD FOREIGN KEY ("comprador_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Custodia_Creditos" ADD FOREIGN KEY ("oferente_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Custodia_Creditos" ADD FOREIGN KEY ("billetera_comprador") REFERENCES "Billetera" ("billetera_id");

ALTER TABLE "Custodia_Creditos" ADD FOREIGN KEY ("billetera_vendedor") REFERENCES "Billetera" ("billetera_id");

ALTER TABLE "Custodia_Creditos" ADD FOREIGN KEY ("intercambio_id") REFERENCES "Intercambio" ("intercambio_id");

ALTER TABLE "Movimiento_Credito" ADD FOREIGN KEY ("billetera_id") REFERENCES "Billetera" ("billetera_id");

ALTER TABLE "Transaccion" ADD FOREIGN KEY ("puntos_id") REFERENCES "Puntos" ("puntos_id");

ALTER TABLE "Transaccion" ADD FOREIGN KEY ("paquete_id") REFERENCES "Paquete_Recarga" ("paquete_id");

ALTER TABLE "Progreso_Mision" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Progreso_Mision" ADD FOREIGN KEY ("mision_id") REFERENCES "Mision" ("mision_id");

ALTER TABLE "Mensaje" ADD FOREIGN KEY ("remitente_id") REFERENCES "Usuario" ("usuario_id");

ALTER TABLE "Mensaje" ADD FOREIGN KEY ("destinatario_id") REFERENCES "Usuario" ("usuario_id");
