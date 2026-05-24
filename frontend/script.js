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

function mostrarAlerta(mensagem, tipo = 'primary') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const texto = document.createElement('span');
    texto.innerText = mensagem;
    
    const fecharBtn = document.createElement('button');
    fecharBtn.className = 'toast-close';
    fecharBtn.innerHTML = '✕';
    fecharBtn.onclick = () => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    };

    toast.appendChild(texto);
    toast.appendChild(fecharBtn);
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

function mostrarConfirmacao(titulo, mensagem, textoConfirmar, acaoConfirmar) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '10000';
    
    overlay.innerHTML = `
        <div class="modal-content modal-md">
            <div class="modal-header primary-bg">
                <div>
                    <h2 style="font-size: 20px;">${titulo}</h2>
                </div>
                <button type="button" class="btn-icon fechar-modal" style="color: white; background: transparent; border: 1px solid rgba(255,255,255,0.3);">
                    ✕
                </button>
            </div>
            <div class="modal-body">
                <p style="font-size: 16px; margin-top: 8px; margin-bottom: 8px; color: var(--text-main);">
                    ${mensagem}
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary cancelar-modal">
                    Cancelar
                </button>
                <button type="button" class="btn btn-danger confirmar-modal">
                    ${textoConfirmar}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const fechar = () => overlay.remove();

    overlay.querySelector('.fechar-modal').onclick = fechar;
    overlay.querySelector('.cancelar-modal').onclick = fechar;
    overlay.querySelector('.confirmar-modal').onclick = () => {
        acaoConfirmar();
        fechar();
    };
}