// app/login/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

//OVO JE WRAPPER OKO LOGIN PAGE.
//OVO SLUZI DA AKO JE KORISNIK LOGOVAN A ODE PONOVO NA /login PAGE
//DA GA VRATI NA "/"
//POSTO LOGIN PAGE KORISTI "use client" DIRECTIVU
//NEMOZE SE U NJEMU KORISTITI cookies().get("token");
export default async function LoginLayout({ children }) {
  const cookieStore = await cookies(); // ✅ await required
  const token = cookieStore.get("token");

  // Redirect if user is already logged in
  if (token) redirect("/");
  return <>{children}</>;
}
