// Archivo: scripts/register.js (Lógica de Frontend, SÓLO se ejecuta en el navegador)

import { supabase } from '../config/db.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Deshabilitar botón para evitar múltiples envíos
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';

            try {
                // 1. Obtener valores
                const nombre = document.getElementById('nombre').value;
                const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
                const correo = document.getElementById('correo_electronico').value;
                const contrasena = document.getElementById('contrasena').value; 

                console.log('🔄 Iniciando proceso de registro...');

                // 2. Registro de autenticación
                const { data, error } = await supabase.auth.signUp({
                    email: correo,
                    password: contrasena
                });

                if (error) {
                    alert('Error en Autenticación: ' + error.message);
                    return;
                }
                
                // 3. Guardar Perfil en tabla 'usuario'
                const userId = data.user.id; 
                
                console.log('✅ Usuario creado en Auth. ID:', userId);
                
                const { error: profileError } = await supabase
                    .from('usuario')
                    .insert([
                        {
                            auth_id: userId, 
                            correo_electronico: correo, 
                            contrasena: contrasena, 
                            nombre_completo: nombre, 
                            fecha_nacimiento: fechaNacimiento,
                            rol: 'Usuario', 
                            saldo_creditos: 100.00 // Créditos iniciales
                        }
                    ]);

                if (profileError) {
                    console.error('❌ Error al guardar perfil:', profileError);
                    alert('Error de base de datos al crear perfil. (Revisa Consola F12 y Política RLS)');
                    return;
                }

                console.log('✅ Perfil creado en tabla usuario');

                // 4. Crear registros en todas las tablas relacionadas
                await crearRegistrosRelacionados(userId);

                alert('✅ ¡Registro exitoso! Se ha creado tu cuenta con 100 créditos de regalo.\n\nAhora puedes iniciar sesión.');
                window.location.href = 'index.html'; 

            } catch (err) {
                console.error('Error inesperado:', err);
                alert('Ocurrió un error. Inténtalo de nuevo.');
            } finally {
                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// Función para crear registros en todas las tablas relacionadas
async function crearRegistrosRelacionados(userId) {
    try {
        console.log('🔄 Creando registros relacionados para usuario:', userId);

        // Array para guardar todas las promesas de inserción
        const inserciones = [];

        // 1. Crear Billetera
        inserciones.push(
            supabase.from('Billetera').insert([{
                usuario_id: userId,
                credito_total: 100,
                credito_actual: 100,
                credito_retenido: 0,
                ultima_actualizacion: new Date()
            }]).then(({ error }) => {
                if (error) {
                    console.error('❌ Error en Billetera:', error);
                } else {
                    console.log('✅ Billetera creada');
                }
            })
        );

        // 2. Crear Billetera_Puntos
        inserciones.push(
            supabase.from('Billetera_Puntos').insert([{
                usuario_id: userId,
                total: 0,
                en_posesion: 0,
                ultima_actualizacion: new Date()
            }]).then(({ error }) => {
                if (error) {
                    console.error('❌ Error en Billetera_Puntos:', error);
                } else {
                    console.log('✅ Billetera_Puntos creada');
                }
            })
        );

        // 3. Crear registro inicial en Bitacora_Usuario
        inserciones.push(
            supabase.from('Bitacora_Usuario').insert([{
                usuario_id: userId,
                accion_realizada: 'Registro de usuario',
                fecha_accion: new Date(),
                detalle: 'Usuario registrado exitosamente en el sistema'
            }]).then(({ error }) => {
                if (error) {
                    console.error('❌ Error en Bitacora_Usuario:', error);
                } else {
                    console.log('✅ Bitacora_Usuario creada');
                }
            })
        );

        // 4. Crear registro en historial
        inserciones.push(
            supabase.from('historial').insert([{
                auth_id: userId,
                fecha: new Date(),
                tipo: 'Registro',
                total: 100
            }]).then(({ error }) => {
                if (error) {
                    console.error('❌ Error en historial:', error);
                } else {
                    console.log('✅ Historial creado');
                }
            })
        );

        // 5. Crear registro inicial en Reportes_Impacto
        inserciones.push(
            supabase.from('Reportes_Impacto').insert([{
                usuario_id: userId,
                id_usuario: 1, // Ajusta según sea necesario
                co2: 0,
                energia_ahorrada: 0,
                agua_preservada: 0,
                fecha_registro: new Date(),
                publicacion_id: null
            }]).then(({ error }) => {
                if (error) {
                    console.error('❌ Error en Reportes_Impacto:', error);
                } else {
                    console.log('✅ Reportes_Impacto creado');
                }
            })
        );

        // Esperar a que todas las inserciones se completen
        await Promise.all(inserciones);

        console.log('🎉 Todos los registros relacionados creados exitosamente');

    } catch (error) {
        console.error('💥 Error creando registros relacionados:', error);
        // No lanzar error para no interrumpir el registro principal
        // Los registros esenciales (usuario y auth) ya están creados
    }
}

// Función para validar contraseña (opcional)
function validarContrasena(contrasena) {
    if (contrasena.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    return true;
}