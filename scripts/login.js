// Archivo: scripts/login.js

import { supabase } from '../config/db.js'; // Asegúrate que la ruta a db.js sea correcta

async function updateLastSession(userId) {
    const now = new Date().toISOString();
    
    // 1. Intentar actualizar en la NUEVA tabla
    const { data: updateData, error: updateError } = await supabase
.from('registro_sesiones') 
        .update({ 
            fecha_ultima_conec: now, // <-- NOMBRE DE COLUMNA FINAL
        })
        .eq('auth_id', userId) // Usamos auth_id como enlace
        .select();

    if (updateError) {
        // MUY IMPORTANTE: Muestra este error
        console.error('❌ ERROR UPDATE SESIÓN:', updateError); 
    }

    // Si falla el update, intenta insertar
    if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
            .from('registro_sesiones') // Usamos la nueva tabla
            .insert([
                { 
                    auth_id: userId,
                    fecha_inicio: now, 
                    fecha_ultima_conec: now, // O 'final_conexion'
                }
            ]);

        
        if (insertError) {
            // MUY IMPORTANTE: Muestra este error
            console.error('❌ ERROR INSERT SESIÓN:', insertError); 
        }
    }
    }

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const email = document.getElementById('login-email').value; 
            const password = document.getElementById('login-contrasena').value; 

            try {
                // 1. Intentar Iniciar Sesión (Sign In)
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    alert('Error de inicio de sesión: Credenciales inválidas. ' + error.message);
                    return;
                }
                
                // 2. Obtener la Sesión para conseguir la ID de Autenticación
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session || !session.user) {
                    console.error('No se pudo obtener la sesión después de iniciar sesión:', sessionError);
                    alert('Inicio de sesión exitoso, pero ocurrió un error al obtener la ID de usuario.');
                    return;
                }
                
                const authId = session.user.id;
                localStorage.setItem('auth_id', authId);
                console.log('✅ ID de usuario guardada en localStorage:', authId);

                // 🚨 PASO CRÍTICO: LLAMADA A LA FUNCIÓN DE SESIÓN FALTANTE
                try {
                    await updateLastSession(authId); // <--- ¡AÑADIDO!
                    console.log('✅ Sesión de usuario actualizada en la DB.');
                } catch (sessionUpdateError) {
                    // Si falla la DB (RLS o error de nombre), lo logueamos, pero no detenemos el login
                    console.error('⚠️ Error al actualizar el registro de sesión:', sessionUpdateError);
                }
                
                // 3. Éxito: Redirigir
                alert('¡Inicio de sesión exitoso!');
                window.location.href = 'index2.html'; 

            } catch (err) {
                console.error('Error inesperado al intentar iniciar sesión:', err);
                alert('Ocurrió un error inesperado. Inténtalo de nuevo.');
            }
        });
    }
});