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

// ✅ Obtener categorías
app.get("/api/categorias", async (req, res) => {
    const { data, error } = await supabase.from("Categorias").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ✅ Insertar publicación
app.post("/api/publicar", async (req, res) => {
    const { titulo, descripcion, foto, precio, categoria_id, usuario_id } = req.body;

    const { data, error } = await supabase.from("Publicacion").insert([
        {
            titulo,
            descripcion,
            foto,
            precio,
            categoria_id,
            usuario_id,
        },
    ]);

    if (error) {
        console.error("❌ ERROR DE INSERCIÓN:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`));