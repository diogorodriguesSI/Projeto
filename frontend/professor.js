const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.tipo !== "professor") {
    window.location.href = "login.html";
}

document.getElementById("nomeProfessor").innerText = usuario.nome;

const selectMateria = document.getElementById("materia");

usuario.materias.forEach((materia) => {
    const option = document.createElement("option");
    option.value = materia.id;
    option.innerText = `${materia.nome} - ${materia.periodo}º Período`;
    selectMateria.appendChild(option);
});

async function criarTrabalho() {
    const mensagem = document.getElementById("mensagem");

    const dados = {
        professorId: usuario.id,
        materiaId: document.getElementById("materia").value,
        titulo: document.getElementById("titulo").value,
        dataInicio: document.getElementById("dataInicio").value,
        dataFim: document.getElementById("dataFim").value,
        quantidadeGrupos: document.getElementById("quantidadeGrupos").value,
        limiteParticipantes: document.getElementById("limiteParticipantes").value,
        usarSenha: document.getElementById("usarSenha").checked,
        senhaGrupo: document.getElementById("senhaGrupo").value,
        temas: document.getElementById("temas").value
            .split("\n")
            .map(t => t.trim())
            .filter(t => t !== "")
    };

    const resposta = await fetch(`${API}/criar-trabalho/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    mensagem.innerText = resultado.mensagem;

    if (resultado.sucesso) {
        carregarTrabalhos();
    }
}

async function carregarTrabalhos() {
    const resposta = await fetch(`${API}/trabalhos/`);
    const trabalhos = await resposta.json();

    const lista = document.getElementById("listaTrabalhos");
    lista.innerHTML = "";

    const meusTrabalhos = trabalhos.filter(
        t => t.professorId === usuario.id
    );

    if (meusTrabalhos.length === 0) {
        lista.innerHTML = "<p>Nenhum trabalho criado ainda.</p>";
        return;
    }

    meusTrabalhos.forEach(trabalho => {
        const div = document.createElement("div");
        div.className = "trabalho";

        div.innerHTML = `
            <h3>${trabalho.titulo}</h3>
            <p><strong>Matéria:</strong> ${trabalho.materia}</p>
            <p><strong>Período:</strong> ${trabalho.periodo}º</p>
            <p><strong>Data:</strong> ${trabalho.dataInicio} até ${trabalho.dataFim}</p>

            <h4>Grupos</h4>

            ${trabalho.grupos.map(grupo => `
                <div class="grupo">
                    <strong>${grupo.nome}</strong>
                    <p><strong>Tema:</strong> ${grupo.tema}</p>
                    <p><strong>Alunos:</strong> ${grupo.alunos.length}/${grupo.limiteParticipantes}</p>
                </div>
            `).join("")}
        `;

        lista.appendChild(div);
    });
}

carregarTrabalhos();