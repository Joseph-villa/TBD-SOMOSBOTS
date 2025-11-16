// main.js (BACKEND - Node.js)

import express from 'express';

import cors from 'cors';

import { supabase } from './db.js';



const app = express();

app.use(cors());

app.use(express.json());



// Endpoint para obtener las categorías desde Supabase

// scripts/main.js - Ruta /api/categoria
app.get("/api/categoria", async (req, res) => {
    // Es posible que el ID se llame 'id' o 'cat_id' en tu tabla de Supabase. 
    // Usa los nombres de columna exactos de tu tabla 'categoria'.
    const { data, error } = await supabase.from("categoria").select("id, nombre"); // ⚠️ Verifica si es 'id' o 'id_categoria'
    
    if (error) {
        console.error("❌ ERROR DE SUPABASE al obtener categorías:", error.message);
        return res.status(500).json({ error: error.message });
    }
    
    // ✅ Agrega un log aquí para ver la data que se envía al frontend
    console.log("✅ Categorías enviadas:", data); 
    res.json(data);
});



// Iniciar servidor

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));




