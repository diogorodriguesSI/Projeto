const API = "http://127.0.0.1:8000/api";

async function fazerLogin() {
    const matricula = document.getElementById("matricula").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const mensagem = document.getElementById("mensagem");

    mensagem.innerText = "";

    try {
        const resposta = await fetch(`${API}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ matricula, senha })
        });

        const dados = await resposta.json();

        console.log("RESPOSTA DO BACKEND:", dados);

        if (dados.sucesso) {
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));

            if (dados.usuario.tipo === "professor") {
                window.location.href = "professor.html";
            } else if (dados.usuario.tipo === "aluno") {
                window.location.href = "aluno.html";
            } else {
                mensagem.innerText = "Tipo de usuário inválido.";
            }

        } else {
            mensagem.innerText = dados.mensagem || "Matrícula ou senha inválida.";
        }

    } catch (erro) {
        console.error("ERRO NO LOGIN:", erro);
        mensagem.innerText = "Erro ao conectar com o backend. Veja o console.";
    }
}

function sair() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}