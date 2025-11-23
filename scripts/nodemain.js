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

async function enviarPublicacion(event) {
    event.preventDefault(); 
    
    // Asume que tienes acceso al cliente de Supabase aquí (para obtener el ID)
    const { data: { user } } = await supabase.auth.getUser(); 
    if (!user) {
        alert("Debes iniciar sesión para publicar.");
        return;
    }
    const usuarioIdActual = user.id;

    // 1. Obtener el valor del radio button seleccionado
    const tipoOfertaElement = document.querySelector('input[name="tipoOferta"]:checked');
    if (!tipoOfertaElement) {
        alert("Debes seleccionar un tipo de oferta.");
        return;
    }
    const tipoOfertaSeleccionada = tipoOfertaElement.value; // Será 'intercambio' o 'monetizacion'

    // 2. Construir el objeto de datos
    const publicacionData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        // ... Asegúrate de incluir todos los demás campos ...
        precio: document.getElementById('precio').value,
        categoria_nombre: document.getElementById('categoria').value,
        usuario_id: usuarioIdActual, 
        tipo_oferta: tipoOfertaSeleccionada // <-- DATO CLAVE ENVIADO AL BACKEND
    };

    // 3. Llamada al Backend (tu servidor Express)
    try {
        // mostrarLoading(); 
        const response = await fetch('/api/publicar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(publicacionData),
        });

        const result = await response.json();
        
        if (!response.ok) {
            // Manejar la respuesta 403 (Acceso denegado) del servidor
            const errorMessage = result.error || 'Error desconocido al publicar.';
            throw new Error(errorMessage);
        }

        // ocultarLoading();
        alert('✅ Publicación creada con éxito!');
        window.location.href = '/dashboard.html'; 
        
    } catch (error) {
        // ocultarLoading();
        console.error('Error al enviar publicación:', error);
        alert('❌ Error al publicar: ' + error.message);
    }
}

// Haz que la función sea accesible si usas onclick en tu botón HTML
window.enviarPublicacion = enviarPublicacion;


// Iniciar servidor

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));




