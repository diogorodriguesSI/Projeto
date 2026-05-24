const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.tipo !== "professor") {
    window.location.href = "login.html";
}

document.getElementById("nomeProfessor").innerText = usuario.nome;

const selectMateria = document.getElementById("materia");

usuario.materias.forEach((materia, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.innerText = `${materia.nome} - ${materia.periodo}º Período`;
    selectMateria.appendChild(option);
});

async function criarTrabalho() {
    const materiaSelecionada = usuario.materias[selectMateria.value];

    const titulo = document.getElementById("titulo").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const quantidadeGrupos = document.getElementById("quantidadeGrupos").value;
    const limiteParticipantes = document.getElementById("limiteParticipantes").value;
    const usarSenha = document.getElementById("usarSenha").checked;
    const senhaGrupo = document.getElementById("senhaGrupo").value;
    const temasTexto = document.getElementById("temas").value;

    const mensagem = document.getElementById("mensagem");

    if (!titulo || !dataInicio || !dataFim || !quantidadeGrupos || !limiteParticipantes) {
        mensagem.innerText = "Preencha todos os campos obrigatórios.";
        return;
    }

    const temas = temasTexto
        .split("\n")
        .map(t => t.trim())
        .filter(t => t !== "");

    const dados = {
        professorMatricula: usuario.matricula,
        professorNome: usuario.nome,
        materia: materiaSelecionada.nome,
        periodo: materiaSelecionada.periodo,
        titulo,
        dataInicio,
        dataFim,
        quantidadeGrupos,
        limiteParticipantes,
        usarSenha,
        senhaGrupo,
        temas
    };

    const resposta = await fetch(`${API}/criar-trabalho/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resultado.sucesso) {
        mensagem.innerText = "Trabalho criado com sucesso!";
        document.getElementById("titulo").value = "";
        document.getElementById("temas").value = "";
        carregarTrabalhos();
    } else {
        mensagem.innerText = resultado.mensagem;
    }
}

async function carregarTrabalhos() {
    const resposta = await fetch(`${API}/trabalhos/`);
    const trabalhos = await resposta.json();

    const lista = document.getElementById("listaTrabalhos");
    lista.innerHTML = "";

    const meusTrabalhos = trabalhos.filter(t => t.professorMatricula === usuario.matricula);

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
                    <p>Tema: ${grupo.tema}</p>
                    <p>Alunos: ${grupo.alunos.length}/${grupo.limiteParticipantes}</p>
                </div>
            `).join("")}
        `;

        lista.appendChild(div);
    });
}

carregarTrabalhos();