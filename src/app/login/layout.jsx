// app/login/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

//OVO JE WRAPPER OKO LOGIN PAGE.
//OVO SLUZI DA AKO JE KORISNIK LOGOVAN A ODE PONOVO NA /login PAGE
//DA GA VRATI NA "/" ILI NA "/homepage"
//OVDIJE JE LOGIKA SLICNA KAO KOD MIDDLEWARE ALI LOGIN
//PAGE NESMIJE BITI ZASTICEN MIDDLWAREOM
//A ISTO TAKO POSTO LOGIN PAGE KORISTI "use client" DIRECTIVU
//NEMOZE SE U NJEMU KORISTITI cookies().get("token");
export default async function LoginLayout({ children }) {
  const cookieStore =await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    //AKO POSTOJI TOKEN I PRI TOME JE VALIDAN REDIRECT TO HOME
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // If valid token, redirect
    redirect("/");
  }
  //A AKO NE POSTOJI TOKEN ILI AKO JE ISTEKAO
  //PREDSTAVI LOGIN PAGE
  return <>{children}</>;
}
