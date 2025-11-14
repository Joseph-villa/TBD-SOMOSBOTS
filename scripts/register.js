// Archivo: scripts/register.js (Lógica de Frontend, SÓLO se ejecuta en el navegador)

import { supabase } from '../config/db.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // 1. Obtener valores
            const nombre = document.getElementById('nombre').value;
            const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
            const correo = document.getElementById('correo_electronico').value;
            const contrasena = document.getElementById('contrasena').value; 

            try {
                // 2. Registro de autenticación
                const { data, error } = await supabase.auth.signUp({
                    email: correo,
                    password: contrasena
                });

                if (error) {
                    alert('Error en Autenticación: ' + error.message); // Captura el error 429 si reaparece
                    return;
                }
                
                // 3. Guardar Perfil - CORRECCIONES APLICADAS AQUÍ
                const userId = data.user.id; 
                
                const { error: profileError } = await supabase
                    .from('usuario')
                    .insert([
                        {
                            // CORRECCIÓN 1: Usar 'aauth_id' (o el nombre correcto de tu columna UUID)
                            auth_id: userId, 
                            
                            correo_electronico: correo, 
                            contrasena: contrasena, 
                            nombre_completo: nombre, 
                            fecha_nacimiento: fechaNacimiento,
                            
                            // CORRECCIÓN 2: Usar 'rol' y el valor de texto 'Usuario' (según tu tabla)
                            rol: 'Usuario', 
                            
                            saldo_creditos: 0.00
                            // Se asume que 'estado' ya fue eliminado, si no, revísalo
                        }
                    ]);

                if (profileError) {
                    console.error('❌ Error al guardar perfil:', profileError);
                    alert('Error de base de datos al crear perfil. (Revisa Consola F12 y Política RLS)');
                    return;
                }
                
                alert('¡Registro exitoso! Ya puedes iniciar sesión. Verifica la tabla usuario.');
                window.location.href = 'index.html'; 

            } catch (err) {
                console.error('Error inesperado:', err);
                alert('Ocurrió un error. Inténtalo de nuevo.');
            }
        });
    }
});