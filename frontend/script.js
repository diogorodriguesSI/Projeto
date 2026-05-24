const API = "http://127.0.0.1:8000/api";

async function fazerLogin() {
    const matricula = document.getElementById("matricula").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const mensagem = document.getElementById("mensagem");

    mensagem.innerText = "";

    const resposta = await fetch(`${API}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ matricula, senha })
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
        localStorage.setItem("usuario", JSON.stringify(dados.usuario));

        if (dados.usuario.tipo === "professor") {
            window.location.href = "./professor.html";
        } else {
            window.location.href = "./aluno.html";
        }
    } else {
        mensagem.innerText = "Matrícula ou senha inválida.";
    }
}

function sair() {
    localStorage.removeItem("usuario");
    window.location.href = "./login.html";
}