const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.tipo !== "professor") {
    window.location.href = "login.html";
}

const parametros = new URLSearchParams(window.location.search);
const trabalhoId = parametros.get("id");

let trabalhoAtual = null;

if (!trabalhoId) {
    mostrarAlerta("Trabalho não encontrado.", 'error');
    window.location.href = "professor.html";
}

async function carregarDetalhesTrabalho() {
    const resposta = await fetch(`${API}/trabalho/${trabalhoId}/`);
    const trabalho = await resposta.json();

    trabalhoAtual = trabalho;

    document.getElementById("tituloTrabalho").innerText = trabalho.titulo;

    document.getElementById("infoTrabalho").innerText =
        `${trabalho.materia} - ${trabalho.periodo}º Período`;

    document.getElementById("resumoMateria").innerText = trabalho.materia;
    document.getElementById("resumoProfessor").innerText = trabalho.professor;
    document.getElementById("resumoPeriodo").innerText = `${trabalho.periodo}º`;
    document.getElementById("resumoInicio").innerText = formatarData(trabalho.dataInicio);
    document.getElementById("resumoFim").innerText = formatarData(trabalho.dataFim);
    document.getElementById("resumoGrupos").innerText = trabalho.grupos.length;

    renderizarGruposDetalhes();
}

function renderizarGruposDetalhes() {
    const lista = document.getElementById("listaGruposDetalhes");
    lista.innerHTML = "";

    if (!trabalhoAtual.grupos || trabalhoAtual.grupos.length === 0) {
        lista.innerHTML = `
            <div class="empty-box">
                Nenhum grupo criado neste trabalho.
            </div>
        `;
        return;
    }

    trabalhoAtual.grupos.forEach(grupo => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <div class="flex-between mb-3">
                <div>
                    <h3 style="font-size: 20px; color: var(--text-main); margin-bottom: 4px;">${grupo.nome}</h3>
                    <p><strong>Tema:</strong> ${grupo.tema}</p>
                </div>
                
                <div class="flex-start" style="align-items: center;">
                    <span class="badge badge-primary">
                        ${grupo.alunos.length}/${grupo.limiteParticipantes} alunos
                    </span>
                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="excluirGrupo(${grupo.id})"
                    >
                        Excluir grupo
                    </button>
                </div>
            </div>

            <div class="form-group" style="background: var(--bg-color); padding: 16px; border-radius: var(--radius-md);">
                <label class="mb-3">Funções disponíveis para os alunos</label>
                
                <div id="lista-funcoes-${grupo.id}" class="flex-column mb-3">
                    ${(grupo.funcoesDisponiveis ? grupo.funcoesDisponiveis.split('\n').filter(f => f.trim() !== '') : []).map(funcao => `
                        <div class="linha-funcao">
                            <input type="text" class="funcao-input-${grupo.id}" value="${funcao.trim()}" placeholder="Nome da função">
                            <button type="button" class="btn btn-danger btn-icon" onclick="this.parentElement.remove()">✕</button>
                        </div>
                    `).join('')}
                </div>

                <div class="flex-start mt-3">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="adicionarFuncaoDetalhe(${grupo.id})"
                    >
                        + Adicionar função
                    </button>

                    <button
                        type="button"
                        class="btn btn-success"
                        onclick="salvarFuncoesGrupo(${grupo.id})"
                    >
                        Salvar funções
                    </button>
                </div>
            </div>

            ${
                grupo.alunos.length === 0
                ? `
                    <div class="empty-box mt-3">
                        Nenhum aluno inscrito neste grupo.
                    </div>
                `
                : `
                    <div class="flex-column mt-3">
                        ${grupo.alunos.map(aluno => montarAlunoHTML(aluno)).join("")}
                    </div>
                `
            }
        `;

        lista.appendChild(div);
    });
}
function adicionarFuncaoDetalhe(grupoId) {
    const container = document.getElementById(`lista-funcoes-${grupoId}`);
    const div = document.createElement('div');
    div.className = 'linha-funcao';
    div.innerHTML = `
        <input type="text" class="funcao-input-${grupoId}" placeholder="Nome da função">
        <button type="button" class="btn btn-danger btn-icon" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

async function salvarFuncoesGrupo(grupoId) {
    const inputs = document.querySelectorAll(`.funcao-input-${grupoId}`);
    const funcoesArray = Array.from(inputs).map(input => input.value.trim()).filter(v => v !== "");
    const funcoes = funcoesArray.join('\n');

    const resposta = await fetch(`${API}/atualizar-funcoes-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            grupoId,
            funcoes
        })
    });

    const resultado = await resposta.json();

    mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

    if (resultado.sucesso) {
        await carregarDetalhesTrabalho();
    }
}


function montarAlunoHTML(alunoGrupo) {
    return `
        <div class="aluno-list-card">

            <div class="flex-start mb-3" style="align-items: center;">
                <div class="avatar-badge">
                    ${pegarIniciais(alunoGrupo.nome)}
                </div>

                <div>
                    <h4 style="font-size: 18px; color: var(--text-main); margin-bottom: 2px;">${alunoGrupo.nome}</h4>
                    <p style="font-size: 14px;">Matrícula: ${alunoGrupo.matricula}</p>
                </div>
            </div>

            <div class="grid-3">

                <div class="form-group">
                    <label>Função no grupo</label>
                    <input
                        type="text"
                        id="funcao-${alunoGrupo.participacaoId}"
                        value="${alunoGrupo.funcao || ""}"
                        placeholder="Ex: Líder, Pesquisa..."
                    >
                </div>

                <div class="form-group">
                    <label>Nota</label>
                    <input
                        type="number"
                        id="nota-${alunoGrupo.participacaoId}"
                        value="${alunoGrupo.nota || ""}"
                        placeholder="0 a 10"
                        min="0"
                        max="10"
                        step="0.1"
                    >
                </div>

                <div class="form-group">
                    <label>Observação</label>
                    <textarea
                        id="observacao-${alunoGrupo.participacaoId}"
                        rows="2"
                        placeholder="Observações..."
                    >${alunoGrupo.observacao || ""}</textarea>
                </div>

            </div>

            <div class="flex-start" style="justify-content: flex-end;">
                <button
                    type="button"
                    class="btn btn-success"
                    onclick="salvarParticipacao(${alunoGrupo.participacaoId})"
                >
                    Salvar
                </button>

                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="removerAlunoGrupo(${alunoGrupo.participacaoId})"
                >
                    Remover aluno
                </button>
            </div>

        </div>
    `;
}

async function salvarParticipacao(participacaoId) {
    const funcao = document.getElementById(`funcao-${participacaoId}`).value;
    const nota = document.getElementById(`nota-${participacaoId}`).value;
    const observacao = document.getElementById(`observacao-${participacaoId}`).value;

    const resposta = await fetch(`${API}/atualizar-participacao/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            participacaoId,
            funcao,
            nota,
            observacao
        })
    });

    const resultado = await resposta.json();

    mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

    if (resultado.sucesso) {
        await carregarDetalhesTrabalho();
    }
}

async function removerAlunoGrupo(participacaoId) {
    mostrarConfirmacao(
        "Remover Aluno",
        "Tem certeza que deseja remover este aluno do grupo?",
        "Remover Aluno",
        async () => {
            const resposta = await fetch(`${API}/remover-aluno-grupo/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    participacaoId
                })
            });

            const resultado = await resposta.json();

            mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

            if (resultado.sucesso) {
                await carregarDetalhesTrabalho();
            }
        }
    );
}

function voltarProfessor() {
    window.location.href = "professor.html";
}

function pegarIniciais(nome) {
    return nome
        .split(" ")
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase();
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

carregarDetalhesTrabalho();



async function excluirGrupo(grupoId) {
    mostrarConfirmacao(
        "Excluir Grupo",
        "Tem certeza que deseja excluir este grupo? Todos os alunos serão removidos dele.",
        "Excluir Grupo",
        async () => {
            const resposta = await fetch(`${API}/excluir-grupo/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    grupoId: grupoId
                })
            });

            const resultado = await resposta.json();

            mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

            if (resultado.sucesso) {
                await carregarDetalhesTrabalho();
            }
        }
    );
}
function abrirModalAdicionarGrupo() {
    document.getElementById("modalAdicionarGrupo").classList.remove("escondido");
}

function fecharModalAdicionarGrupo() {
    document.getElementById("modalAdicionarGrupo").classList.add("escondido");

    document.getElementById("novoGrupoNome").value = "";
    document.getElementById("novoGrupoTema").value = "";
    document.getElementById("novoGrupoLimite").value = "4";
    document.getElementById("novoGrupoSenha").value = "";
}

async function adicionarGrupo() {
    const nome = document.getElementById("novoGrupoNome").value;
    const tema = document.getElementById("novoGrupoTema").value;
    const limiteParticipantes = document.getElementById("novoGrupoLimite").value;
    const senha = document.getElementById("novoGrupoSenha").value;

    if (!tema || !limiteParticipantes) {
        mostrarAlerta("Preencha pelo menos o tema e o limite de participantes.", 'warning');
        return;
    }

    const resposta = await fetch(`${API}/adicionar-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            trabalhoId: trabalhoId,
            nome: nome,
            tema: tema,
            limiteParticipantes: limiteParticipantes,
            senha: senha
        })
    });

    const resultado = await resposta.json();

    mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

    if (resultado.sucesso) {
        fecharModalAdicionarGrupo();
        await carregarDetalhesTrabalho();
    }
}

async function excluirTrabalho() {
    mostrarConfirmacao(
        "Excluir Trabalho",
        "Tem certeza que deseja excluir este trabalho? Todos os grupos e alunos inscritos nele serão removidos.",
        "Excluir Trabalho",
        async () => {
            const resposta = await fetch(`${API}/excluir-trabalho/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    trabalhoId: trabalhoId
                })
            });

            const resultado = await resposta.json();

            mostrarAlerta(resultado.mensagem, resultado.sucesso ? 'success' : 'error');

            if (resultado.sucesso) {
                window.location.href = "professor.html";
            }
        }
    );
}