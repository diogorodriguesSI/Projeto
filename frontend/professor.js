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
        limite: 4,
        tema: "",
        funcoes: ["Líder", "Pesquisador", "Documentador"]
    });

    renderizarGrupos();
}

function removerGrupoVisual(index) {
    gruposVisuais.splice(index, 1);
    renderizarGrupos();
}

function atualizarGrupo(index, campo, valor) {
    gruposVisuais[index][campo] = valor;
}

function atualizarFuncao(indexGrupo, indexFuncao, valor) {
    gruposVisuais[indexGrupo].funcoes[indexFuncao] = valor;
}

function adicionarFuncaoGrupo(indexGrupo) {
    gruposVisuais[indexGrupo].funcoes.push("");
    renderizarGrupos();
}

function removerFuncaoGrupo(indexGrupo, indexFuncao) {
    gruposVisuais[indexGrupo].funcoes.splice(indexFuncao, 1);
    renderizarGrupos();
}

function renderizarGrupos() {
    gruposProfessor.innerHTML = "";

    if (gruposVisuais.length === 0) {
        gruposProfessor.innerHTML = `
            <div class="empty-box">
                Nenhum grupo adicionado. Clique em "Adicionar Grupo" para começar.
            </div>
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

            <label>Número de participantes</label>
            <input
                type="number"
                min="1"
                value="${grupo.limite}"
                onchange="atualizarGrupo(${index}, 'limite', this.value)"
            >

            <label>Tema do grupo</label>
            <input
                type="text"
                value="${grupo.tema}"
                onchange="atualizarGrupo(${index}, 'tema', this.value)"
                placeholder="Ex: Banco de Dados"
            >

            <label>Funções disponíveis para este grupo</label>

            <div class="funcoes-box">
                ${grupo.funcoes.map((funcao, i) => `
                    <div class="linha-funcao">
                        <input
                            type="text"
                            value="${funcao}"
                            onchange="atualizarFuncao(${index}, ${i}, this.value)"
                            placeholder="Ex: Líder, Pesquisador, Programador"
                        >

                        <button
                            type="button"
                            class="btn-remover"
                            onclick="removerFuncaoGrupo(${index}, ${i})"
                        >
                            Remover
                        </button>
                    </div>
                `).join("")}

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="adicionarFuncaoGrupo(${index})"
                >
                    + Adicionar função
                </button>
            </div>
        `;

        gruposProfessor.appendChild(div);
    });
}

async function criarTrabalho() {
    const mensagem = document.getElementById("mensagem");
    mensagem.innerText = "";

    if (gruposVisuais.length === 0) {
        mensagem.innerText = "Adicione pelo menos um grupo.";
        return;
    }

    const titulo = document.getElementById("titulo").value.trim();
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const usarSenha = document.getElementById("usarSenha").checked;
    const senhaGrupo = document.getElementById("senhaGrupo").value.trim();

    if (!titulo || !dataInicio || !dataFim) {
        mensagem.innerText = "Preencha todos os campos obrigatórios.";
        return;
    }

    const algumGrupoSemTema = gruposVisuais.some(g => !g.tema.trim());

    if (algumGrupoSemTema) {
        mensagem.innerText = "Todos os grupos precisam ter um tema.";
        return;
    }

    const funcoesGerais = gruposVisuais[0].funcoes
        .map(f => f.trim())
        .filter(f => f !== "");

    if (funcoesGerais.length === 0) {
        mensagem.innerText = "Adicione pelo menos uma função.";
        return;
    }

    const dados = {
        professorId: usuario.id,
        materiaId: Number(selectMateria.value),
        titulo: titulo,
        dataInicio: dataInicio,
        dataFim: dataFim,
        quantidadeGrupos: gruposVisuais.length,
        limiteParticipantes: Number(gruposVisuais[0].limite),
        usarSenha: usarSenha,
        senhaGrupo: senhaGrupo,
        temas: gruposVisuais.map(g => g.tema),
        funcoes: funcoesGerais
    };

    try {
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
            document.getElementById("usarSenha").checked = false;

            gruposVisuais = [];
            renderizarGrupos();
            carregarTrabalhos();
        }

    } catch (erro) {
        mensagem.innerText = "Erro ao criar trabalho. Verifique se o servidor Django está ligado.";
    }
}

async function carregarTrabalhos() {
    const resposta = await fetch(`${API}/trabalhos/`);
    const trabalhos = await resposta.json();

    const lista = document.getElementById("listaTrabalhos");
    lista.innerHTML = "";

    const meusTrabalhos = trabalhos.filter(
        t => Number(t.professorId) === Number(usuario.id)
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
                    <p><strong>Período:</strong> ${trabalho.periodo}º Período</p>
                </div>

                <button type="button" onclick="abrirPaginaDetalhes(${trabalho.id})">
                    Analisar
                </button>
            </div>

            <div class="trabalho-info">
                <p><strong>Data de início:</strong><br>${formatarData(trabalho.dataInicio)}</p>
                <p><strong>Data final:</strong><br>${formatarData(trabalho.dataFim)}</p>
                <p><strong>Grupos:</strong><br>${trabalho.grupos.length} grupo(s)</p>
            </div>
        `;

        lista.appendChild(div);
    });
}

function abrirPaginaDetalhes(trabalhoId) {
    window.location.href = `professor_detalhes.html?id=${trabalhoId}`;
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

renderizarGrupos();
carregarTrabalhos();