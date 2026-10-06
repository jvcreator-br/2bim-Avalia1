const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const statusLogin = document.getElementById("status-login");
const botaoBaixar = document.getElementById("baixar");
const botaoGerar = document.getElementById("gerar");
const botaoSair = document.getElementById("sair-google");
let idToken = "";
let svgAtual = "";
let versaoLogin = 0;

function limparDesenho() {
  svgAtual = "";
  area.replaceChildren();
  botaoBaixar.hidden = true;
}

function sair() {
  idToken = "";
  versaoLogin++;
  window.google?.accounts?.id.disableAutoSelect();
  statusLogin.textContent = "Entre com sua conta Google.";
  botaoSair.hidden = true;
  limparDesenho();
}

botaoSair.addEventListener("click", () => {
  sair();
  mensagem.textContent = "Você saiu do login.";
});

const googleScript = document.createElement("script");
googleScript.src = "https://accounts.google.com/gsi/client?hl=pt-BR";
googleScript.async = true;
googleScript.onload = () => {
  google.accounts.id.initialize({
    client_id: "778231462173-1akqnhjru0ll1kg2amrit1ja5v3le6fi.apps.googleusercontent.com",
    auto_select: false,
    callback: (resposta) => {
      if (typeof resposta.credential !== "string" || !resposta.credential) {
        mensagem.textContent = "Não foi possível concluir o login. Tente novamente.";
        return;
      }
      idToken = resposta.credential;
      versaoLogin++;
      limparDesenho();
      statusLogin.textContent = "Login Google recebido. Você já pode desenhar.";
      mensagem.textContent = "";
      botaoSair.hidden = false;
    },
  });
  google.accounts.id.renderButton(document.getElementById("login-google"), {
    theme: "outline", size: "large", text: "signin_with", locale: "pt-BR",
  });
};
googleScript.onerror = () => {
  statusLogin.textContent = "Falha ao carregar o login Google. Recarregue a página.";
};
document.head.append(googleScript);

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (botaoGerar.disabled) return;
  limparDesenho();
  mensagem.textContent = "";
  const numero = Number(campoNumero.value);
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }
  const sessao = versaoLogin;
  botaoGerar.disabled = true;
  mensagem.textContent = "Gerando desenho...";
  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: "Bearer " + idToken } : {}),
      },
      body: JSON.stringify({ numero }),
    });
    if (sessao !== versaoLogin) return;
    if (resposta.status === 400) {
      mensagem.textContent = "Número inválido. Digite um inteiro entre 1 e 100.";
      return;
    }
    if (resposta.status === 401) {
      sair();
      mensagem.textContent = "Entre com sua conta Google. Se o login expirou, entre novamente.";
      return;
    }
    if (!resposta.ok || !resposta.headers.get("Content-Type")?.includes("image/svg+xml")) {
      throw new Error("Falha ao gerar desenho");
    }
    const svg = await resposta.text();
    if (sessao !== versaoLogin) return;
    svgAtual = svg;
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
    mensagem.textContent = "Desenho gerado e assinado com seu e-mail Google.";
  } catch {
    if (sessao === versaoLogin) mensagem.textContent = "Não foi possível gerar o desenho. Verifique sua conexão e tente novamente.";
  } finally {
    botaoGerar.disabled = false;
  }
});

botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const url = URL.createObjectURL(new Blob([svgAtual], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
