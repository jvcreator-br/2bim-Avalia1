# Desenho Assinado

Nome: João Vitor Andreata

RA: 2026107880

URL: https://2bim-avalia1-dd4.pages.dev/

O site recebe um número inteiro de 1 a 100 e gera uma figura em SVG com o e-mail da conta Google autenticada. O desenho original usa 240 pontos em uma circunferência e a tabuada modular.

## Como usar

1. Acesse o site e entre com sua conta Google.
2. Digite um inteiro entre 1 e 100 e clique em Desenhar.
3. Clique em Baixar SVG para salvar o resultado.
4. Use Sair do login para encerrar a sessão no site.

O token fica somente na memória da página. Ao recarregar ou sair, é necessário entrar novamente.

## Organização

- `public/index.html`: formulário e botão de login, sem campo de e-mail.
- `public/script.js`: login Google, chamada da API, mensagens de erro e download.
- `public/style.css`: aparência da página.
- `lib/desenho.js`: função original de geração do SVG, executada no servidor.
- `functions/api/desenho.js`: valida o pedido e o login antes de gerar a figura.
- `evidencias/exemplo.svg`: desenho de número 80, correspondente aos dois últimos dígitos do RA, baixado do site publicado.

## API

`POST /api/desenho`, com JSON `{"numero":80}` e cabeçalho `Authorization: Bearer <id_token>`.

A validação acontece nesta ordem:

1. Método diferente de POST: 405.
2. Corpo ausente, JSON inválido ou número fora do intervalo inteiro de 1 a 100: 400.
3. Token ausente, inválido, expirado, de outro cliente ou e-mail não verificado: 401.
4. Pedido válido: 200 e `Content-Type: image/svg+xml`.

O servidor consulta o tokeninfo do Google, confere o cliente com `GOOGLE_CLIENT_ID`, a expiração e `email_verified`. A assinatura usa somente o e-mail retornado pelo Google.

## Publicação

Cloudflare Pages conectado à branch `main` deste repositório. Framework: None. Comando de build vazio. Diretório de saída: `public`. Variável de produção: `GOOGLE_CLIENT_ID` com o ID público do cliente OAuth Web. A origem JavaScript autorizada no Google é a URL do site acima.

Não é necessário usar um segredo do cliente no navegador.
