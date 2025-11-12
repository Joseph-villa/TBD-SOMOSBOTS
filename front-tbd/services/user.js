const errorMessages = {
  // Errores de usuario/email
  'user_already_exists': 'Ya existe una cuenta con este correo',
  'email_exists': 'Este correo ya está registrado',
  'invalid_email': 'El correo es invalido',
  'email_not_allowed': 'Este dominio del correo no está permitido',

  // Errores de contraseña
  'weak_password': 'La contraseña es muy débil',
  'password_mismatch': 'Las contraseñas no coinciden',
  'password_length_exceeded': 'La contraseña es demasiado larga',

  // Errores de login
  'invalid_credentials': 'Error, revisa tus credenciales',
  'invalid_login_credentials': 'Error, revisa tus credenciales',
  'unconfirmed_email': 'Confirma tu correo antes de iniciar sesión',
  'email_not_confirmed': 'Confirma tu correo antes de iniciar sesión',

  // Errores de límites
  'over_email_send_rate_limit': 'Demasiados intentos. Espera unos minutos',
  'rate_limit_exceeded': 'Demasiados intentos. Intenta nuevamente en 5 minutos',
  'too_many_requests': 'Demasiadas solicitudes. Espera un momento',

  // Errores de red/servidor
  'network_error': 'Error de conexión. Verifica tu internet',
  'server_error': 'Error del servidor. Intenta más tarde',
  'service_unavailable': 'Servicio no disponible temporalmente',
  'request_timeout': 'La solicitud tardó demasiado. Intenta nuevamente',

  // Errores de sesión
  'session_expired': 'Tu sesión ha expirado. Inicia sesión nuevamente',
  'invalid_refresh_token': 'Error de sesión. Inicia sesión otra vez',

  // Errores de base de datos/RLS
  '23505': 'Este usuario ya existe en el sistema',
  '42501': 'No tienes permisos para realizar esta acción',
  'new row violates row-level security policy': 'Restricción de seguridad. Contacta al administrador',
}

// ----------------------------------------------------------------------
// 2. FUNCIONES DE AUTENTICACIÓN
// ----------------------------------------------------------------------

// Cliente
export async function register(nombre, correo_electronico, contrasena, supabase) {

  // 1. Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: correo_electronico,
    password: contrasena,
    options: {
      data: {
        nombre: nombre
      }
    }
  });

  if (error) {
    console.error('Error de registro de usuario:', error.code, error.message);
    return {
      status: "error",
      content: errorMessages[error.code] || "Ocurrio un error. Intenta nuevamente"
    }
  }

  console.error(data);

  return {
    status: "ok",
    content: "Registro exitoso. Se envio un correo de verificación."
  }
}

// Cliente
export async function login(correoElectronico, contrasena, supabase) {
  // ... (Tu código de login)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correoElectronico,
    password: contrasena
  });

  if (error) {
    console.error('Error de inicio de sesión:', error.code, error.message);
    return {
      status: "error",
      content: errorMessages[error.code]
    }
  }

  return {
    status: "ok",
    content: "Se inicio la sesión del usuario."
  }
}

// Servidor
export async function getProfile(supabase) {

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return {
      status: "error",
      content: "Error al obtener el perfil del usuario. No se ha especificado el usuario o no existe"
    }
  }

  const { sub: auth_id, email: correo_electronico, nombre } = data.claims.user_metadata

  const { data: profile, error: lookError } = await supabase
    .from("Usuario")
    .select("*")
    .eq("auth_id", auth_id)
    .maybeSingle()

  if (lookError) {
    console.error("Error al buscar el perfil del usuario", lookError.code, lookError.message)
    return {
      status: "error",
      content: errorMessages[lookError.code] || "Error al buscar el perfil del usuario"
    }
  }

  if (profile) {
    return {
      status: "ok",
      content: profile
    }
  }

  console.error("El perfil de usuario no existe, se debe crear un nuevo perfil")

  return await createProfile(nombre, correo_electronico, auth_id, supabase)
}

// Servidor
async function createProfile(nombre, correo_electronico, auth_id, supabase) {
  // 2. Insertar los datos del perfil del usuario en la tabla `Usuario`
  const { data: newProfile, error } = await supabase
    .from('Usuario')
    .insert([
      {
        auth_id,
        nombre: nombre || "Usuario",
        correo_electronico: correo_electronico,
        contrasena: 'Hashed_Password',
        estado: 'activo',
        rol_id: 2
      }
    ])
    .select()
    .single()

  // --- 3. VERIFICAR INSERCIÓN EN BD ---
  if (error) {
    console.error('Error: Fallo al insertar en tabla "Usuario".', error.code, error.message);
    return {
      status: "error",
      content: "Fallo en la creación del perfil del usuario."
    }
  }

  console.log('Éxito: Perfil de usuario creado correctamente en tabla "Usuario".');
  return {
    status: "ok",
    content: newProfile
  }
}



export async function checkSession(supabase) {
  const { data: { session } } = await supabase.auth.getSession();

  return session
}
