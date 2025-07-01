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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  //AKO POSTOJI TOKEN I PRI TOME JE VALIDAN REDIRECT TO HOME
  if (token) {
    let isValid = false;
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch (err) {
      console.log("Token invalid or expired:", err.message);
    }

    if (isValid) {
      // Safe to call redirect outside of try/catch
      redirect("/");
    }
  }
  //A AKO NE POSTOJI TOKEN ILI AKO JE ISTEKAO
  //PREDSTAVI LOGIN PAGE
  return <>{children}</>;
}

/*
If redirect("/") is called inside a try/catch, Next.js throws a 
special error (NEXT_REDIRECT) to exit the route early — but your 
catch block catches it as if it were a regular error, 
which causes unexpected behavior (e.g., showing the login page instead of redirecting).
*/
