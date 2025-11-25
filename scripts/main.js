// scripts/main.js (Archivo limpio de Servidor - Backend)

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

// 🔗 Conexión con Supabase (para uso del servidor)
const supabaseUrl = 'https://dzatmxvwmpczteaqpmmm.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YXRteHZ3bXBjenRlYXFwbW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjY3OTAsImV4cCI6MjA3NjEwMjc5MH0.8Xf6Mx6DzJ4tGSO-VlisiBlUpgC4XxmAdNRf6j3afAs";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../")));

// scripts/main.js (VERIFICADO)
app.get("/api/categoria", async (req, res) => {
    // Aquí deberías asegurarte de que Supabase te devuelve la ID y el nombre
const { data, error } = await supabase.from("categoria").select("id_categoria, nombre"); // ⚠️ Verifica si es 'id' o 'id_categoria'    // ...
if (error) {
        console.error("❌ ERROR DE SUPABASE al obtener categorías:", error.message);
        return res.status(500).json({ error: error.message });
    }
    
    // ✅ Agrega un log aquí para ver la data que se envía al frontend
    console.log("✅ Categorías enviadas:", data); 
    res.json(data);

});

// scripts/main.js


// scripts/main.js (Añade o confirma estas rutas)

// Ruta para servir index.html (funciona para http://localhost:3000/)
app.get('/', (req, res) => {
    // Nota: Si usas index2.html, cambia el nombre
    res.sendFile(path.join(__dirname, '..', 'index2.html')); 
});

// Ruta para servir perfil.html (funciona para http://localhost:3000/perfil)
app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'perfil.html')); 
});

// Ruta para servir publicar.html (funciona para http://localhost:3000/publicar)
app.get('/publicar', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'publicar.html')); 
});



// ✅ Insertar publicación
app.post("/api/publicar", async (req, res) => {
  const { titulo, descripcion, foto, precio, categoria_nombre, usuario_id,tipo_oferta } = req.body;

    try {
        // 🚨 VALIDACIÓN CLAVE: Si falta una variable, falla el insert.
        if (!usuario_id || !categoria_nombre || !titulo) {
             return res.status(400).json({ error: "Faltan datos obligatorios (usuario, categoría o título)." });
        }
        
// --- 🔒 VERIFICACIÓN DE ROL PARA MONETIZACIÓN ---
        if (tipo_oferta === 'monetizacion') {
            const rolUsuario = await obtenerRolUsuario(usuario_id);
            
            if (rolUsuario !== 'Emprendedor') {
                console.log(`❌ Publicación bloqueada. Usuario ${usuario_id} tiene rol: ${rolUsuario}`);
                return res.status(403).json({ 
                    error: "Acceso denegado. Solo los Emprendedores pueden crear publicaciones de monetización." 
                });
            }
        }

        const { data, error } = await supabase.from("Publicacion").insert([
            {
                titulo,
                descripcion,
                imagen_url: foto,
                precio,
                nombre_categoria: categoria_nombre, // OK, guarda el nombre
                usuario_id: usuario_id,             // OK
                tipo_oferta: tipo_oferta || 'intercambio', // Guardar el tipo de oferta
            },
        ]);

        if (error) {
            // Esto se enviará al frontend en formato JSON
            console.error("❌ ERROR DE INSERCIÓN EN BD:", error.message);
            return res.status(500).json({ error: `Fallo en Supabase: ${error.message}` });
        }
        
        res.json({ success: true, data });

    } catch (e) {
        // ✅ Esto captura ERRORES DE SINTAXIS/PROGRAMACIÓN y devuelve JSON, 
        // evitando el error "<!DOCTYPE...".
        console.error("❌ ERROR INESPERADO EN API /PUBLICAR:", e.message, e.stack);
        res.status(500).json({ error: "Error interno del servidor al procesar la solicitud. Revisa la consola de Express." });
    }
});
// --- Función de Utilidad para obtener el Rol del Usuario ---

async function obtenerRolUsuario(usuarioId) {
    if (!usuarioId) return 'Desconocido';

    try {
        const { data, error } = await supabase
            .from("usuario")
            .select("rol")
            .eq("auth_id", usuarioId) // Asume que 'auth_id' enlaza con auth.users(id)
            .single();

        if (error || !data) {
            console.error("Error al obtener rol para el usuario:", usuarioId, error?.message);
            return 'Usuario'; // Rol por defecto o de fallback
        }

        return data.rol; // Devolverá 'Usuario', 'Administrador', o 'Emprendedor'
    } catch (e) {
        console.error("Excepción al obtener rol:", e.message);
        return 'Usuario';
    }
}

// --- ENDPOINTS DE LA APLICACIÓN ---

// Ruta para obtener las categorías
app.get("/api/categoria", async (req, res) => {
    const { data, error } = await supabase.from("categoria").select("id, nombre"); 
    
    if (error) {
        console.error("❌ ERROR DE SUPABASE al obtener categorías:", error.message);
        return res.status(500).json({ error: error.message });
    }
    
    console.log("✅ Categorías enviadas:", data); 
    res.json(data);
});


// Ruta para insertar una nueva publicación con VERIFICACIÓN DE ROL
app.post("/api/publicar", async (req, res) => {
    // 🚨 Asegúrate de que el frontend envíe 'tipo_oferta'
    const { 
        titulo, 
        descripcion, 
        foto, 
        precio, 
        categoria_nombre, 
        usuario_id, 
        tipo_oferta 
    } = req.body;

    try {
        if (!usuario_id || !categoria_nombre || !titulo) {
             return res.status(400).json({ error: "Faltan datos obligatorios (usuario, categoría o título)." });
        }
        
        // --- 🔒 LÓGICA DE VERIFICACIÓN DE ROL PARA MONETIZACIÓN ---
        if (tipo_oferta === 'monetizacion') {
            const rolUsuario = await obtenerRolUsuario(usuario_id);
            
            if (rolUsuario !== 'Emprendedor') {
                console.log(`❌ Publicación de monetización bloqueada. Usuario ${usuario_id} tiene rol: ${rolUsuario}`);
                // Devolver error 403 (Prohibido)
                return res.status(403).json({ 
                    error: "Acceso denegado. Solo los Emprendedores pueden crear publicaciones de monetización." 
                });
            }
        }
        // ----------------------------------------------------

        // 💡 NOTA: Agrega 'tipo_oferta' a tu inserción de Supabase
        const { data, error } = await supabase.from("Publicacion").insert([
            {
                titulo,
                descripcion,
                imagen_url: foto,
                precio,
                nombre_categoria: categoria_nombre, 
                usuario_id: usuario_id,
                tipo_oferta: tipo_oferta || 'intercambio', // Asegurar que se guarda un valor por defecto
            },
        ]);

        if (error) {
            console.error("❌ ERROR DE INSERCIÓN EN BD:", error.message);
            return res.status(500).json({ error: `Fallo en Supabase: ${error.message}` });
        }
        
        res.json({ success: true, data });

    } catch (e) {
        console.error("❌ ERROR INESPERADO EN API /PUBLICAR:", e.message, e.stack);
        res.status(500).json({ error: "Error interno del servidor. Revisa la consola de Express." });
    }
});



const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`));