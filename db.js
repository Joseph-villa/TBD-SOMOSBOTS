const { createClient } = supabase;

const supabaseUrl = 'https://dzatmxvwmpczteaqpmmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YXRteHZ3bXBjenRlYXFwbW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjY3OTAsImV4cCI6MjA3NjEwMjc5MH0.8Xf6Mx6DzJ4tGSO-VlisiBlUpgC4XxmAdNRf6j3afAs';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ALERTA DE CONEXIÓN INICIAL
if (supabaseClient) {
    console.log("Supabase Client inicializado correctamente.");
    alert("🟢 CONEXIÓN: Cliente Supabase inicializado.");
} else {
    console.error("Supabase Client falló la inicialización.");
    alert("🔴 ERROR: Cliente Supabase NO se pudo inicializar.");
}


async function testSupabaseConnection() {
    // Intenta hacer una consulta muy simple
    const { data, error } = await supabaseClient.from('usuario').select('id_usuario').limit(1);

    if (error) {
        console.error("🔴 ERROR CRÍTICO DE CONEXIÓN/PERMISOS:", error);
        // Si RLS está activo y no hay sesión, este es el error esperado
        if (error.code === 'PPL100' || error.message.includes("policy")) {
        alert("✅ CONEXIÓN OK, PERO RLS ESTÁ ACTIVO. ¡Continúa con el registro!");
        } else {
        alert(`❌ FALLO DE CONEXIÓN/CLAVE: ${error.message}. Revisa URL y clave.`);
        }
    } else {
        console.log("🟢 CONEXIÓN OK. Datos recibidos:", data);
        alert("🟢 CONEXIÓN OK Y RLS INACTIVO. ¡Continúa con el registro!");
    }
}

// Llama a la función al cargar la página
testSupabaseConnection();


// ----------------------------------------------------------------------
// 2. FUNCIONES DE AUTENTICACIÓN
// ----------------------------------------------------------------------

async function registerUser(nombre, fecha_nacimiento, correo_electronico, contrasena) {
    
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: correo_electronico,
        password: contrasena
    });

    if (authError) {
        console.error('ERROR 1: Error de registro de autenticación:', authError.message);
        alert(`🔴 FALLO REGISTRO: ${authError.message}`);
        return;
    }
    
    const newUser = authData.user; 
    
    if (!newUser) {
        console.warn('ADVERTENCIA: Usuario creado, pero no hay sesión activa.');
        alert('🟡 REGISTRO OK: Usuario creado. Revisa tu correo para confirmar antes de insertar datos.');
        window.location.href = 'index.html'; 
        return;
    }

    // ALERTA DE AUTENTICACIÓN EXITOSA
    console.log(`Usuario autenticado (ID: ${newUser.id}). Intentando inserción...`);
    alert("✅ AUTH OK: Usuario creado y autenticado.");


    // 2. Insertar los datos adicionales del usuario en la tabla `usuario`
    const { data, error: insertError } = await supabaseClient
        .from('usuario')
        .insert([
            { 
                // 🛑 CORRECCIÓN: Usar 'auth_id'
                auth_id: newUser.id, 
                nombre: nombreCompleto, 
                // 🛑 CORRECCIÓN: Usar 'correo_electronico' (sin espacios ni tilde)
                correo_electronico: correoElectronico, 
                fecha_nacimiento: fechaNacimiento, // Asumiendo que esta columna existe
                contrasena: contrasena, 
                estado_usr: 'activo', 
                rol_id: 2 
            }
        ]);

    // --- 3. VERIFICAR INSERCIÓN EN BD ---
    if (insertError) {
        console.error('ERROR 2: Fallo al insertar en tabla "usuario". Detalles:', insertError);
        // ALERTA DE FALLO EN INSERCIÓN (Problema de RLS o Esquema)
        alert(`❌ DB FALLÓ: ${insertError.message}. Revisa la política RLS y el esquema de la tabla.`);
    } else {
        console.log('ÉXITO 2: Usuario registrado correctamente en tabla "usuario".');
        // ALERTA DE ÉXITO FINAL
        alert('🎉 REGISTRO COMPLETO: Usuario guardado en base de datos.');
        window.location.href = 'index.html'; 
    }
}


async function loginUser(correoElectronico, contrasena) {
    // ... (Tu código de login)
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: correoElectronico,
        password: contrasena
    });

    if (error) {
        console.error('Error de inicio de sesión:', error.message);
        alert(`🔴 FALLO LOGIN: ${error.message}`);
        return;
    }

    console.log('Usuario autenticado:', data.user);
    alert("✅ LOGIN OK: Bienvenido.");
    window.location.href = 'dashboard.html'; 
}


async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html'; 
    }
}

// ----------------------------------------------------------------------
// 3. EVENT LISTENERS
// ----------------------------------------------------------------------

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre_completo').value;
        const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
        const correoElectronico = document.getElementById('correo_electronico').value;
        const contrasena = document.getElementById('contrasena').value;

        registerUser(nombreC, fechaNacimiento, correoElectronico, contrasena);
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const correoElectronico = document.getElementById('login-email').value;
        const contrasena = document.getElementById('login-password').value;

        loginUser(correoElectronico, contrasena);
    });
}

if (window.location.pathname.endsWith('/dashboard.html')) {
    checkSession();
}