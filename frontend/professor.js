const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.tipo !== "professor") {
    window.location.href = "login.html";
}

document.getElementById("nomeProfessor").innerText = usuario.nome;

const selectMateria = document.getElementById("materia");
const gruposProfessor = document.getElementById("gruposProfessor");

let gruposVisuais = [];

usuario.materias.forEach((materia) => {
    const option = document.createElement("option");
    option.value = materia.id;
    option.innerText = `${materia.nome} - ${materia.periodo}º Período`;
    selectMateria.appendChild(option);
});

function adicionarGrupoVisual() {
    gruposVisuais.push({
        nome: `Grupo ${gruposVisuais.length + 1}`,
        limite: 1,
        tema: "",
        regras: "",
        anotacoes: ""
    });

    renderizarGrupos();
}

function removerGrupoVisual(index) {
    gruposVisuais.splice(index, 1);
    renderizarGrupos();
}

function renderizarGrupos() {
    gruposProfessor.innerHTML = "";

    if (gruposVisuais.length === 0) {
        gruposProfessor.innerHTML = `
            <p class="empty-box">
                Nenhum grupo adicionado. Clique em "Adicionar Grupo" para começar.
            </p>
        `;
        return;
    }

    gruposVisuais.forEach((grupo, index) => {
        const div = document.createElement("div");
        div.className = "grupo-form";

        div.innerHTML = `
            <div class="grupo-form-header">
                <input
                    type="text"
                    value="${grupo.nome}"
                    onchange="atualizarGrupo(${index}, 'nome', this.value)"
                    placeholder="Nome do grupo"
                >

                <button type="button" onclick="removerGrupoVisual(${index})">
                    ✕
                </button>
            </div>

            <label>Número de Participantes</label>
            <input
                type="number"
                min="1"
                value="${grupo.limite}"
                onchange="atualizarGrupo(${index}, 'limite', this.value)"
            >

            <label>Tema do Grupo</label>
            <input
                type="text"
                value="${grupo.tema}"
                onchange="atualizarGrupo(${index}, 'tema', this.value)"
                placeholder="Ex: Banco de Dados"
            >

            <label>Regras do Grupo</label>
            <textarea
                rows="3"
                onchange="atualizarGrupo(${index}, 'regras', this.value)"
                placeholder="Descreva as regras deste grupo..."
            >${grupo.regras}</textarea>

            <label>Anotações</label>
            <textarea
                rows="3"
                onchange="atualizarGrupo(${index}, 'anotacoes', this.value)"
                placeholder="Anotações adicionais..."
            >${grupo.anotacoes}</textarea>
        `;

        gruposProfessor.appendChild(div);
    });
}

function atualizarGrupo(index, campo, valor) {
    gruposVisuais[index][campo] = valor;
}

async function criarTrabalho() {
    const mensagem = document.getElementById("mensagem");

    if (gruposVisuais.length === 0) {
        mensagem.innerText = "Adicione pelo menos um grupo.";
        return;
    }

    const titulo = document.getElementById("titulo").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    if (!titulo || !dataInicio || !dataFim) {
        mensagem.innerText = "Preencha todos os campos obrigatórios.";
        return;
    }

    const dados = {
        professorId: usuario.id,
        materiaId: document.getElementById("materia").value,
        titulo: titulo,
        dataInicio: dataInicio,
        dataFim: dataFim,
        quantidadeGrupos: gruposVisuais.length,
        limiteParticipantes: gruposVisuais[0].limite,
        usarSenha: document.getElementById("usarSenha").checked,
        senhaGrupo: document.getElementById("senhaGrupo").value,
        temas: gruposVisuais.map(g => g.tema || g.nome)
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
        document.getElementById("titulo").value = "";
        document.getElementById("dataInicio").value = "";
        document.getElementById("dataFim").value = "";
        document.getElementById("senhaGrupo").value = "";

        gruposVisuais = [];
        renderizarGrupos();
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
        lista.innerHTML = `
            <div class="empty-box">
                Nenhum trabalho criado ainda.
            </div>
        `;
        return;
    }

    meusTrabalhos.forEach(trabalho => {
        const div = document.createElement("div");
        div.className = "trabalho-card";

        div.innerHTML = `
            <div class="trabalho-header">
                <div>
                    <h3>${trabalho.titulo}</h3>
                    <p><strong>Matéria:</strong> ${trabalho.materia}</p>
                </div>

                <button onclick="abrirDetalhes(${trabalho.id})">
                    Analisar
                </button>
            </div>

            <div class="trabalho-info">
                <p><strong>Data de Início:</strong><br>${formatarData(trabalho.dataInicio)}</p>
                <p><strong>Data Final:</strong><br>${formatarData(trabalho.dataFim)}</p>
                <p><strong>Grupos:</strong><br>${trabalho.grupos.length} grupo(s)</p>
            </div>
        `;

        lista.appendChild(div);
    });
}

async function abrirDetalhes(id) {
    const resposta = await fetch(`${API}/trabalhos/`);
    const trabalhos = await resposta.json();

    const trabalho = trabalhos.find(t => t.id === id);

    let texto = `${trabalho.titulo}\n\n`;
    texto += `Matéria: ${trabalho.materia}\n`;
    texto += `Professor: ${trabalho.professorNome}\n`;
    texto += `Data: ${trabalho.dataInicio} até ${trabalho.dataFim}\n\n`;

    trabalho.grupos.forEach(grupo => {
        texto += `${grupo.nome}\n`;
        texto += `Tema: ${grupo.tema}\n`;
        texto += `Alunos: ${grupo.alunos.length}/${grupo.limiteParticipantes}\n\n`;
    });

    alert(texto);
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

carregarTrabalhos();