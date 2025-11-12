import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logoutButton";
import { getProfile } from "@/services/user";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/");
  }

  const user = getProfile(supabase)

  return (
    <div className="">
      <div className="">
        <div className="">
          Pagina protegida
          <LogoutButton />
        </div>
      </div>
      <div className="">
        <h2 className="">Detalles del Usuario</h2>
        <pre className="">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>
      <div className="">
        <h2 className="">Perfil de Usuario</h2>
        <pre className="">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}