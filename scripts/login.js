// Archivo: scripts/login.js

import { supabase } from '../config/db.js'; // Asegúrate que la ruta a db.js sea correcta

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // 1. Obtener valores usando los IDs de index.html
            // CORRECCIÓN: Usamos 'login-contrasena' en lugar de 'login-password'
            const email = document.getElementById('login-email').value; 
            const password = document.getElementById('login-contrasena').value; 

            try {
                // 2. Intentar Iniciar Sesión (Sign In)
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    alert('Error de inicio de sesión: Credenciales inválidas. ' + error.message);
                    return;
                }
                
                // 3. Éxito: Redirigir a la nueva pantalla principal
                alert('¡Inicio de sesión exitoso!');
                window.location.href = 'index2.html'; // Redirige a la pantalla principal

            } catch (err) {
                console.error('Error inesperado al intentar iniciar sesión:', err);
                alert('Ocurrió un error inesperado. Inténtalo de nuevo.');
            }
        });
    }
});