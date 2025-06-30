// app/login/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

//OVO JE WRAPPER OKO LOGIN PAGE.
//OVO SLUZI DA AKO JE KORISNIK LOGOVAN A ODE PONOVO NA /login PAGE
//DA GA VRATI NA "/"
//OVDIJE JE LOGIKA SLICNA KAO KOD MIDDLEWARE ALI LOGIN
//PAGE NESMIJE BITI ZASTICEN MIDDLWAREOM
//POSTO LOGIN PAGE KORISTI "use client" DIRECTIVU
//NEMOZE SE U NJEMU KORISTITI cookies().get("token");
export default async function LoginLayout({ children }) {
  const cookieStore = await cookies(); // ✅ await required
  const token = cookieStore.get("token")?.value;

  // Redirect if user is already logged in
  if (token) {
    try {
      //AKO POSTOJI TOKEN I PRI TOME JE VALIDAN REDIRECT TO HOME
      await jwtVerify(token, JWT_SECRET);
      redirect("/");
    } catch (err) {
      // Token is invalid or expired – do nothing, allow access to login page
      console.log("Invalid or expired token:", err.message);
    }
  }
  return <>{children}</>;
}
