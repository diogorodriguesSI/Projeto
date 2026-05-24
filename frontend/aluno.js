const aluno = JSON.parse(localStorage.getItem("usuario"));

if (!aluno || aluno.tipo !== "aluno") {
    window.location.href = "login.html";
}

document.getElementById("dadosAluno").innerText =
    `${aluno.nome} - ${aluno.periodo}º Período`;

let todosTrabalhos = [];
let trabalhoSelecionado = null;
let grupoSelecionado = null;

async function carregarTrabalhosAluno() {
    const resposta = await fetch(`${API}/trabalhos/?periodo=${aluno.periodo}`);
    const trabalhos = await resposta.json();

    todosTrabalhos = trabalhos;

    const lista = document.getElementById("listaTrabalhosAluno");
    lista.innerHTML = "";

    if (trabalhos.length === 0) {
        lista.innerHTML = `
            <div class="empty-box">
                Nenhum trabalho disponível para seu período ainda.
            </div>
        `;
        return;
    }

    const materias = {};

    trabalhos.forEach(trabalho => {
        if (!materias[trabalho.materia]) {
            materias[trabalho.materia] = [];
        }

        materias[trabalho.materia].push(trabalho);
    });

    Object.keys(materias).forEach(materia => {
        const divMateria = document.createElement("div");
        divMateria.className = "materia-box";

        divMateria.innerHTML = `
            <button type="button" class="materia-header" onclick="alternarMateria(this)">
                <div>
                    <span class="seta">▶</span>
                    <strong>${materia}</strong>
                    <span class="badge">${materias[materia].length} trabalho(s)</span>
                </div>
            </button>

            <div class="materia-conteudo escondido">
                ${materias[materia].map(trabalho => montarTrabalhoHTML(trabalho)).join("")}
            </div>
        `;

        lista.appendChild(divMateria);
    });
}

function montarTrabalhoHTML(trabalho) {
    return `
        <div class="aluno-trabalho-card">
            <div class="aluno-trabalho-topo">
                <div>
                    <h3>${trabalho.titulo}</h3>
                    <p class="descricao">Trabalho criado pelo professor ${trabalho.professorNome}</p>
                    <p class="professor">
                        <strong>Professor:</strong> ${trabalho.professorNome}
                    </p>
                </div>

                <button type="button" onclick="abrirDetalhes(${trabalho.id})">
                    👁 Ver Detalhes
                </button>
            </div>

            <div class="aluno-info-grid">
                <div>
                    <span>📅 Início</span>
                    <strong>${formatarData(trabalho.dataInicio)}</strong>
                </div>

                <div>
                    <span>📅 Término</span>
                    <strong>${formatarData(trabalho.dataFim)}</strong>
                </div>

                <div>
                    <span>👥 Grupos</span>
                    <strong>${trabalho.grupos.length} disponível(is)</strong>
                </div>
            </div>

            <h4>Grupos Disponíveis:</h4>

            <div class="aluno-grupos-grid">
                ${trabalho.grupos.map(grupo => montarGrupoHTML(trabalho, grupo)).join("")}
            </div>
        </div>
    `;
}

function montarGrupoHTML(trabalho, grupo) {
    const ocupados = grupo.alunos.length;
    const limite = grupo.limiteParticipantes;
    const livres = limite - ocupados;
    const lotado = livres <= 0;

    const alunoEstaNesteGrupo = grupo.alunos.some(a => a.id === aluno.id);

    const alunoEstaEmOutroGrupoDoTrabalho = trabalho.grupos.some(
        g => g.alunos.some(a => a.id === aluno.id)
    );

    let statusClasse = "status-verde";

    if (lotado) {
        statusClasse = "status-vermelho";
    } else if (livres <= 2) {
        statusClasse = "status-amarelo";
    }

    let botao = "";

    if (alunoEstaNesteGrupo) {
        botao = `
            <button
                type="button"
                class="btn-sair-grupo"
                onclick="sairGrupo(${grupo.id})"
            >
                Sair deste grupo
            </button>
        `;
    } else if (alunoEstaEmOutroGrupoDoTrabalho) {
        botao = `
            <button type="button" disabled>
                Já inscrito
            </button>
        `;
    } else {
        botao = `
            <button
                type="button"
                ${lotado ? "disabled" : ""}
                onclick="abrirInscricao(${trabalho.id}, ${grupo.id})"
            >
                ${lotado ? "Lotado" : "Inscrever"}
            </button>
        `;
    }

    return `
        <div class="aluno-grupo-card ${lotado ? "lotado" : ""}">
            <div class="grupo-card-topo">
                <div>
                    <h5>${grupo.nome}</h5>

                    <div class="grupo-tags">
                        ${trabalho.usarSenha ? `<span class="tag-lock">🔒 Protegido</span>` : ""}

                        <span class="${statusClasse}">
                            ${lotado ? "Cheio" : `${livres} vaga(s)`}
                        </span>

                        ${alunoEstaNesteGrupo ? `
                            <span class="status-inscrito">
                                Você está neste grupo
                            </span>
                        ` : ""}

                        ${alunoEstaNesteGrupo ? montarAreaAlunoGrupo(grupo) : ""}
                    </div>
                </div>

                ${botao}
            </div>

            <p><strong>Tema:</strong> ${grupo.tema}</p>
            <p><strong>Participantes:</strong> ${ocupados}/${limite}</p>

            <p class="alunos-lista">
                <strong>Alunos:</strong>
                ${
                    grupo.alunos.length > 0
                    ? grupo.alunos.map(a => a.nome).join(", ")
                    : "Nenhum aluno ainda"
                }
            </p>
        </div>
    `;
}

function alternarMateria(botao) {
    const conteudo = botao.nextElementSibling;
    const seta = botao.querySelector(".seta");

    conteudo.classList.toggle("escondido");
    seta.innerText = conteudo.classList.contains("escondido") ? "▶" : "▼";
}

function abrirDetalhes(trabalhoId) {
    trabalhoSelecionado = todosTrabalhos.find(t => t.id === trabalhoId);

    document.getElementById("modalTitulo").innerText = trabalhoSelecionado.titulo;
    document.getElementById("modalMateria").innerText =
        `${trabalhoSelecionado.materia} - ${trabalhoSelecionado.professorNome}`;

    document.getElementById("modalCorpo").innerHTML = `
        <div class="detalhe-bloco">
            <h3>Descrição</h3>
            <p>Trabalho criado pelo professor ${trabalhoSelecionado.professorNome}.</p>
        </div>

        <div class="aluno-info-grid">
            <div>
                <span>Data de Início</span>
                <strong>${formatarData(trabalhoSelecionado.dataInicio)}</strong>
            </div>

            <div>
                <span>Data Final</span>
                <strong>${formatarData(trabalhoSelecionado.dataFim)}</strong>
            </div>

            <div>
                <span>Quantidade de Grupos</span>
                <strong>${trabalhoSelecionado.grupos.length}</strong>
            </div>
        </div>

        <h3>Grupos (${trabalhoSelecionado.grupos.length})</h3>

        ${trabalhoSelecionado.grupos.map(grupo => montarDetalheGrupoHTML(grupo)).join("")}
    `;

    document.getElementById("modalDetalhes").classList.remove("escondido");
}

function montarDetalheGrupoHTML(grupo) {
    const ocupados = grupo.alunos.length;
    const limite = grupo.limiteParticipantes;
    const livres = limite - ocupados;
    const lotado = livres <= 0;

    const alunoEstaNesteGrupo = grupo.alunos.some(a => a.id === aluno.id);

    const alunoEstaEmOutroGrupoDoTrabalho = trabalhoSelecionado.grupos.some(
        g => g.alunos.some(a => a.id === aluno.id)
    );

    let botao = "";

    if (alunoEstaNesteGrupo) {
        botao = `
            <button
                type="button"
                class="btn-sair-grupo"
                onclick="sairGrupo(${grupo.id})"
            >
                Sair deste grupo
            </button>
        `;
        
    } else if (alunoEstaEmOutroGrupoDoTrabalho) {
        botao = `
            <button type="button" disabled>
                Já inscrito
            </button>
        `;
    } else {
        botao = `
            <button
                type="button"
                ${lotado ? "disabled" : ""}
                onclick="abrirInscricao(${trabalhoSelecionado.id}, ${grupo.id})"
            >
                ${lotado ? "Lotado" : "Inscrever-se"}
            </button>
        `;
    }

    return `
        <div class="detalhe-grupo">
            <div class="grupo-card-topo">
                <div>
                    <h4>${grupo.nome}</h4>

                    <span class="${lotado ? "status-vermelho" : "status-verde"}">
                        ${lotado ? "Cheio" : `${livres} vaga(s)`}
                    </span>

                    ${alunoEstaNesteGrupo ? `
                        <span class="status-inscrito">
                            Você está neste grupo
                        </span>
                    ` : ""}
                </div>

                ${botao}
            </div>

            <p><strong>Tema:</strong> ${grupo.tema}</p>
            <p><strong>Participantes:</strong> ${ocupados}/${limite}</p>
            <p><strong>Alunos:</strong> ${
                grupo.alunos.length > 0
                ? grupo.alunos.map(a => a.nome).join(", ")
                : "Nenhum aluno ainda"
            }</p>
        </div>
    `;
}

function fecharDetalhes() {
    document.getElementById("modalDetalhes").classList.add("escondido");
}

function abrirInscricao(trabalhoId, grupoId) {
    trabalhoSelecionado = todosTrabalhos.find(t => t.id === trabalhoId);
    grupoSelecionado = trabalhoSelecionado.grupos.find(g => g.id === grupoId);

    const alunoJaInscrito = trabalhoSelecionado.grupos.find(
        grupo => grupo.alunos.some(a => a.id === aluno.id)
    );

    if (alunoJaInscrito) {
        alert(
            `Você já está inscrito no grupo.\n\nGrupo atual: ${alunoJaInscrito.nome}\nTema: ${alunoJaInscrito.tema}`
        );
        return;
    }

    document.getElementById("modalGrupoNome").innerText = grupoSelecionado.nome;

    if (trabalhoSelecionado.usarSenha) {
        document.getElementById("campoSenhaGrupo").innerHTML = `
            <label>🔒 Senha do Grupo</label>
            <input
                type="password"
                id="senhaGrupoAluno"
                placeholder="Digite a senha do grupo"
            >
        `;
    } else {
        document.getElementById("campoSenhaGrupo").innerHTML = "";
    }

    document.getElementById("infoGrupoModal").innerHTML = `
        <p><strong>Grupo:</strong> ${grupoSelecionado.nome}</p>
        <p><strong>Tema:</strong> ${grupoSelecionado.tema}</p>
        <p><strong>Participantes:</strong> ${grupoSelecionado.alunos.length}/${grupoSelecionado.limiteParticipantes}</p>
    `;

    document.getElementById("modalInscricao").classList.remove("escondido");
}

function fecharInscricao() {
    document.getElementById("modalInscricao").classList.add("escondido");
}

async function confirmarInscricao() {
    let senha = "";

    if (trabalhoSelecionado.usarSenha) {
        senha = document.getElementById("senhaGrupoAluno").value;
    }

    const resposta = await fetch(`${API}/entrar-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            alunoId: aluno.id,
            grupoId: grupoSelecionado.id,
            senha: senha
        })
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso && resultado.grupo) {
        alert(
            `${resultado.mensagem}\n\nGrupo atual: ${resultado.grupo.nome}\nTema: ${resultado.grupo.tema}`
        );
        return;
    }

    alert(resultado.mensagem);

    if (resultado.sucesso) {
        grupoSelecionado.alunos.push({
            id: aluno.id,
            nome: aluno.nome,
            matricula: aluno.matricula
        });

        fecharInscricao();

        abrirDetalhes(trabalhoSelecionado.id);
    }
}

async function sairGrupo(grupoId) {
    const confirmar = confirm("Tem certeza que deseja sair deste grupo?");

    if (!confirmar) {
        return;
    }

    const resposta = await fetch(`${API}/sair-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            alunoId: aluno.id,
            grupoId: grupoId
        })
    });

    const resultado = await resposta.json();

    alert(resultado.mensagem);

    if (resultado.sucesso) {
        trabalhoSelecionado.grupos.forEach(grupo => {
            grupo.alunos = grupo.alunos.filter(
                a => a.id !== aluno.id
            );
        });

        abrirDetalhes(trabalhoSelecionado.id);
    }
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

carregarTrabalhosAluno();

function montarAreaAlunoGrupo(grupo) {
    const alunoNoGrupo = grupo.alunos.find(a => a.id === aluno.id);

    const funcoes = grupo.funcoesDisponiveis
        ? grupo.funcoesDisponiveis.split(",").map(f => f.trim()).filter(f => f !== "")
        : [];

    return `
        <div class="area-participacao-aluno">
            <h4>Minha participação</h4>

            <label>Escolha sua função</label>
            <select id="funcaoAluno-${grupo.id}">
                <option value="">Selecione uma função</option>
                ${funcoes.map(funcao => `
                    <option value="${funcao}">
                        ${funcao}
                    </option>
                `).join("")}
            </select>

            <label>Anotações</label>
            <textarea
                id="anotacaoAluno-${grupo.id}"
                rows="3"
                placeholder="Escreva suas anotações sobre sua parte..."
            ></textarea>

            <label>Enviar arquivo</label>
            <input
                type="file"
                id="arquivoAluno-${grupo.id}"
            >

            <button
                type="button"
                class="btn-confirmar"
                onclick="salvarMinhaParticipacao(${grupo.id})"
            >
                Salvar minha participação
            </button>
        </div>
    `;
}

async function salvarMinhaParticipacao(grupoId) {
    const funcao = document.getElementById(`funcaoAluno-${grupoId}`).value;
    const anotacaoAluno = document.getElementById(`anotacaoAluno-${grupoId}`).value;
    const arquivoInput = document.getElementById(`arquivoAluno-${grupoId}`);

    const formData = new FormData();

    formData.append("alunoId", aluno.id);
    formData.append("grupoId", grupoId);
    formData.append("funcao", funcao);
    formData.append("anotacaoAluno", anotacaoAluno);

    if (arquivoInput.files.length > 0) {
        formData.append("arquivo", arquivoInput.files[0]);
    }

    const resposta = await fetch(`${API}/atualizar-minha-participacao/`, {
        method: "POST",
        body: formData
    });

    const resultado = await resposta.json();

    alert(resultado.mensagem);
}