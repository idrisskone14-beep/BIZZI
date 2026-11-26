// Outils communs aux fonctions Vercel de Zeyds (le dossier _lib n'est pas expose comme route).
import { neon } from "@neondatabase/serverless";

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

export function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

let client = null;

/** Client SQL Neon (HTTP, sans pool) ; DATABASE_URL = chaine de connexion de zeyds-prod. */
export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL absente");
    client = neon(url);
  }
  return client;
}

/** Numero ivoirien au format 225XXXXXXXXXX, ou "" s'il est invalide. */
export function normalizeIvorianPhone(value) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10) digits = "225" + digits;
  return /^225\d{10}$/.test(digits) ? digits : "";
}
