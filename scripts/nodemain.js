// main.js (BACKEND - Node.js)

import express from 'express';

import cors from 'cors';

import { supabase } from './supabaseClient.js';



const app = express();

app.use(cors());

app.use(express.json());



// Endpoint para obtener las categorías desde Supabase

app.get('/categorias', async (req, res) => {

  try {

    const { data, error } = await supabase

      .from('Categorias')

      .select('id_categoria, nombre')

      .order('nombre', { ascending: true });



    if (error) throw error;

    res.json(data);

  } catch (err) {

    console.error('Error al obtener categorías:', err.message);

    res.status(500).json({ error: 'Error al obtener categorías' });

  }

});



// Iniciar servidor

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));




