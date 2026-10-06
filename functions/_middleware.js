// Impede o acesso ao antigo arquivo publico, inclusive apos a migracao.
export function onRequest({ request, next }) {
  const caminho = new URL(request.url).pathname;
  if (caminho === "/desenho.js" || caminho === "/public/desenho.js" || caminho.startsWith("/lib/")) {
    return new Response("Arquivo nao encontrado.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return next();
}
