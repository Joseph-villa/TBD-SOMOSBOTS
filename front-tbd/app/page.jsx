'use client'

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login } from '@/services/user'
import { useState } from "react";
import { Loading } from "@/components/Loading";
import styles from './page.module.css'

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password, supabase);
      if (result.status === "ok") {
        router.push("/dashboard");
      } else {
        setError(result.content);
      }
    }
    catch (error) {
      setError("Ocurrio un error.");
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
        <h2 className={styles.loginTitle}>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className={styles.login}>
          <input
            type="email"
            name="Correo"
            placeholder="Correo"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setError("")}
          />
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
          <button
            type="submit"
            disabled={loading}
          >
            Ingresar
          </button>
          <a
            href="#"
            className={styles.primary}
          >
            ¿Olvidaste tu contraseña?
          </a>
          <Link
            href={"/register"}
            className={styles.primary}
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </form>
        {error ? <p className={styles.errorMessage}>{error}</p> : ""}
      </div>
    </div >
  );
}
