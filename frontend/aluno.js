const aluno = JSON.parse(localStorage.getItem("usuario"));

if (!aluno || aluno.tipo !== "aluno") {
    window.location.href = "login.html";
}

document.getElementById("dadosAluno").innerText =
    `${aluno.nome} - ${aluno.periodo}º Período`;

async function carregarTrabalhosAluno() {
    const resposta = await fetch(`${API}/trabalhos/?periodo=${aluno.periodo}`);
    const trabalhos = await resposta.json();

    const lista = document.getElementById("listaTrabalhos");
    lista.innerHTML = "";

    if (trabalhos.length === 0) {
        lista.innerHTML = "<p>Nenhum trabalho disponível para seu período ainda.</p>";
        return;
    }

    trabalhos.forEach(trabalho => {
        const div = document.createElement("div");
        div.className = "trabalho";

        div.innerHTML = `
            <h3>${trabalho.titulo}</h3>
            <p><strong>Professor:</strong> ${trabalho.professorNome}</p>
            <p><strong>Matéria:</strong> ${trabalho.materia}</p>
            <p><strong>Data:</strong> ${trabalho.dataInicio} até ${trabalho.dataFim}</p>

            <h4>Escolha um grupo</h4>

            ${trabalho.grupos.map(grupo => `
                <div class="grupo">
                    <strong>${grupo.nome}</strong>
                    <p><strong>Tema:</strong> ${grupo.tema}</p>
                    <p><strong>Vagas:</strong> ${grupo.alunos.length}/${grupo.limiteParticipantes}</p>
                    <p><strong>Alunos:</strong> ${
                        grupo.alunos.length > 0
                        ? grupo.alunos.map(a => a.nome).join(", ")
                        : "Nenhum aluno ainda"
                    }</p>

                    ${trabalho.usarSenha ? `
                        <input type="password" id="senha-${trabalho.id}-${grupo.id}" placeholder="Senha do grupo">
                    ` : ""}

                    <button onclick="entrarGrupo(${trabalho.id}, ${grupo.id}, ${trabalho.usarSenha})">
                        Entrar neste grupo
                    </button>
                </div>
            `).join("")}
        `;

        lista.appendChild(div);
    });
}

async function entrarGrupo(trabalhoId, grupoId, usarSenha) {
    let senha = "";

    if (usarSenha) {
        senha = document.getElementById(`senha-${trabalhoId}-${grupoId}`).value;
    }

    const resposta = await fetch(`${API}/entrar-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            trabalhoId,
            grupoId,
            aluno,
            senha
        })
    });

    const resultado = await resposta.json();

    alert(resultado.mensagem);

    if (resultado.sucesso) {
        carregarTrabalhosAluno();
    }
}

carregarTrabalhosAluno();