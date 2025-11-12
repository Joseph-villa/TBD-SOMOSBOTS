'use client'

import Image from "next/image";
import Link from "next/link";
import styles from './page.module.css'
import { register } from '@/services/user'
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loading } from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    setLoading(true);
    setError("");

    try {
      const result = await register(nombre, email, password, supabase);

      if (result.status === "ok") {
        window.alert(result.content)
        router.push("/");
      } else {
        setError(result.content);
      }
    }
    catch (error) {
      setError(error.message);
    }
    finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className={styles.section}>
      <div className={styles.logo}>
        <Image
          src={'/logo.png'}
          alt="Logo Plataforma de Trueque Digital"
          height={'160'}
          width={'240'}
        />
        <p className={styles.text}>con Créditos Verdes</p>
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.loginTitle}>Datos del Usuario</h2>
        <form onSubmit={handleSubmit} className={styles.login}>
          <label className={styles.labels}>
            Nombre
            <input
              type="text"
              name="Nombre"
              placeholder="Nombre"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onFocus={() => setError("")}
            />
          </label>
          <label className={styles.labels}>
            Correo
            <input
              type="email"
              name="Correo"
              placeholder="Correo@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setError("")}
            />
          </label>
          <label className={styles.labels}>
            Contraseña
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setError("")}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
          >
            Registrarse
          </button>

          <Link
            href={"/"}
            className={styles.primary}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </form>
        {error ? <p className={styles.errorMessage}>{error}</p> : ""}
      </div>
    </div >
  );
}
