import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

function erro(status, mensagem, headers = {}) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return erro(405, "Use POST para gerar o desenho.", { Allow: "POST" });
  }
  let corpo;
  try { corpo = await request.json(); }
  catch { return erro(400, "Envie um JSON com numero inteiro entre 1 e 100."); }
  if (!corpo || !numeroValido(corpo.numero)) {
    return erro(400, "Digite um inteiro entre 1 e 100.");
  }
  const autorizacao = request.headers.get("Authorization") || "";
  const token = /^Bearer\s+(\S+)$/i.exec(autorizacao)?.[1];
  if (!token) return erro(401, "Entre com sua conta Google para continuar.");
  let identidade;
  try {
    const resposta = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token));
    if (resposta.status !== 200) return erro(401, "Login invalido ou expirado. Entre novamente.");
    identidade = await resposta.json();
  } catch {
    return erro(401, "Nao foi possivel validar o login. Entre novamente.");
  }
  if (!env.GOOGLE_CLIENT_ID || identidade.aud !== env.GOOGLE_CLIENT_ID ||
      identidade.email_verified !== "true" || typeof identidade.email !== "string" ||
      !identidade.email || !Number.isFinite(Number(identidade.exp)) ||
      Number(identidade.exp) <= Date.now() / 1000) {
    return erro(401, "Login invalido ou expirado. Entre novamente.");
  }
  return new Response(gerarDesenho(corpo.numero, identidade.email), {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
