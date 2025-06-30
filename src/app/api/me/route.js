import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

//OVU RUTU KORISTIMO DA DOBAVIMO USERNAME OD TOKENA
//DA BI SMO U NAVBARU MOGLI KONDICIONO DA PREDASTAVIMO
//ODREDJEN LINKOVE, POSTO KORISTIMO HTTPONLY KOJI
//SE NEMOZE OCITATI NA KLIJENTU
export async function GET(req) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];

  if (!token) return NextResponse.json({ isLoggedIn: false });
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return NextResponse.json({ isLoggedIn: true, user: payload });
  } catch (error) {
    return NextResponse.json({ isLoggedIn: false });
  }
}
