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
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; background: var(--bg-color);">
            <div class="flex-between mb-3">
                <div>
                    <h3 style="font-size: 20px;">${trabalho.titulo}</h3>
                    <p style="color: var(--text-muted); font-size: 14px;">Criado por: <strong>${trabalho.professorNome}</strong></p>
                </div>

                <button type="button" class="btn btn-primary" onclick="abrirDetalhes(${trabalho.id})">
                    Ver Detalhes
                </button>
            </div>

            <div class="info-grid">
                <div class="info-box">
                    <span>Início</span>
                    <strong>${formatarData(trabalho.dataInicio)}</strong>
                </div>

                <div class="info-box">
                    <span>Término</span>
                    <strong>${formatarData(trabalho.dataFim)}</strong>
                </div>

                <div class="info-box">
                    <span>Grupos</span>
                    <strong>${trabalho.grupos.length} disponível(is)</strong>
                </div>
            </div>

            <h4 class="mt-3 mb-3">Grupos disponíveis</h4>

            <div class="grid-2">
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

    const alunoNoGrupo = grupo.alunos.find(a => Number(a.id) === Number(aluno.id));

    const alunoEstaEmOutroGrupoDoTrabalho = trabalho.grupos.some(
        g => g.alunos.some(a => Number(a.id) === Number(aluno.id))
    );

    let statusClasse = "status-verde";

    if (lotado) {
        statusClasse = "status-vermelho";
    } else if (livres <= 2) {
        statusClasse = "status-amarelo";
    }

    let botao = "";

    if (alunoNoGrupo) {
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
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; background: ${lotado ? 'var(--bg-color)' : 'var(--card-bg)'};">
            <div class="flex-between mb-3" style="align-items: flex-start;">
                <div>
                    <h5 style="font-size: 18px; margin-bottom: 8px;">${grupo.nome}</h5>

                    <div class="tags-container">
                        ${trabalho.usarSenha ? `<span class="badge badge-warning">🔒 Protegido</span>` : ""}

                        <span class="badge badge-${lotado ? 'danger' : 'success'}">
                            ${lotado ? "Cheio" : `${livres} vaga(s)`}
                        </span>

                        ${alunoNoGrupo ? `
                            <span class="badge badge-primary">
                                Você está neste grupo
                            </span>
                        ` : ""}
                    </div>
                </div>

                ${botao}
            </div>

            <p style="margin-bottom: 4px;"><strong>Tema:</strong> ${grupo.tema}</p>
            <p style="margin-bottom: 4px;"><strong>Participantes:</strong> ${ocupados}/${limite}</p>

            <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">
                <strong>Alunos:</strong>
                ${
                    grupo.alunos.length > 0
                    ? grupo.alunos.map(a => a.nome).join(", ")
                    : "Nenhum aluno ainda"
                }
            </p>

            ${alunoNoGrupo ? montarAreaAlunoGrupo(grupo, alunoNoGrupo) : ""}
        </div>
    `;
}

function montarAreaAlunoGrupo(grupo, alunoNoGrupo) {
    const funcoes = grupo.funcoesDisponiveis
        ? grupo.funcoesDisponiveis
            .split("\n")
            .map(f => f.trim())
            .filter(f => f !== "")
        : [];

    return `
        <div class="area-participacao">
            <h4>Minha participação</h4>

            <div style="background: var(--card-bg); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--success-hover);">
                <strong>Sua nota:</strong>
                <span style="color: var(--success); font-weight: 700;">${alunoNoGrupo.nota || "Professor ainda não lançou"}</span>
            </div>

            ${
                alunoNoGrupo.observacao
                ? `<p class="mb-3"><strong>Observação do professor:</strong> ${alunoNoGrupo.observacao}</p>`
                : ""
            }

            <div class="form-group">
                <label>Escolha sua função</label>
                <select id="funcaoAluno-${grupo.id}">
                    <option value="">Selecione uma função</option>
                    ${funcoes.map(funcao => `
                        <option
                            value="${funcao}"
                            ${alunoNoGrupo.funcao === funcao ? "selected" : ""}
                        >
                            ${funcao}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div class="form-group">
                <label>Anotações</label>
                <textarea
                    id="anotacaoAluno-${grupo.id}"
                    rows="3"
                    placeholder="Escreva suas anotações sobre sua parte..."
                >${alunoNoGrupo.anotacaoAluno || ""}</textarea>
            </div>

            <div class="form-group">
                <label>Enviar arquivo</label>
                <input
                    type="file"
                    id="arquivoAluno-${grupo.id}"
                >
            </div>

            ${
                alunoNoGrupo.arquivoUrl
                ? `<p class="mb-3"><a href="http://127.0.0.1:8000${alunoNoGrupo.arquivoUrl}" target="_blank" style="color: var(--primary); font-weight: 600;">Ver arquivo enviado</a></p>`
                : ""
            }

            <button
                type="button"
                class="btn btn-primary"
                onclick="salvarMinhaParticipacao(${grupo.id})"
            >
                Salvar minha participação
            </button>
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
    trabalhoSelecionado = todosTrabalhos.find(t => Number(t.id) === Number(trabalhoId));

    document.getElementById("modalTitulo").innerText = trabalhoSelecionado.titulo;
    document.getElementById("modalMateria").innerText =
        `${trabalhoSelecionado.materia} - ${trabalhoSelecionado.professorNome}`;

    document.getElementById("modalCorpo").innerHTML = `
        <div class="mb-3">
            <h3 style="font-size: 18px; margin-bottom: 8px;">Descrição</h3>
            <p>Trabalho criado pelo professor <strong>${trabalhoSelecionado.professorNome}</strong>.</p>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <span>Data de Início</span>
                <strong>${formatarData(trabalhoSelecionado.dataInicio)}</strong>
            </div>

            <div class="info-box">
                <span>Data Final</span>
                <strong>${formatarData(trabalhoSelecionado.dataFim)}</strong>
            </div>

            <div class="info-box">
                <span>Total de Grupos</span>
                <strong>${trabalhoSelecionado.grupos.length}</strong>
            </div>
        </div>

        <h3 class="mt-3 mb-3">Grupos (${trabalhoSelecionado.grupos.length})</h3>

        <div class="flex-column">
            ${trabalhoSelecionado.grupos.map(grupo => montarDetalheGrupoHTML(grupo)).join("")}
        </div>
    `;

    document.getElementById("modalDetalhes").classList.remove("escondido");
}

function montarDetalheGrupoHTML(grupo) {
    const ocupados = grupo.alunos.length;
    const limite = grupo.limiteParticipantes;
    const livres = limite - ocupados;
    const lotado = livres <= 0;

    const alunoNoGrupo = grupo.alunos.find(a => Number(a.id) === Number(aluno.id));

    const alunoEstaEmOutroGrupoDoTrabalho = trabalhoSelecionado.grupos.some(
        g => g.alunos.some(a => Number(a.id) === Number(aluno.id))
    );

    let botao = "";

    if (alunoNoGrupo) {
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
        <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
            <div class="flex-between mb-3" style="align-items: flex-start;">
                <div>
                    <h4 style="font-size: 18px;">${grupo.nome}</h4>

                    <span class="badge badge-${lotado ? 'danger' : 'success'} mt-3">
                        ${lotado ? "Cheio" : `${livres} vaga(s)`}
                    </span>

                    ${alunoNoGrupo ? `
                        <span class="badge badge-primary">
                            Você está neste grupo
                        </span>
                    ` : ""}
                </div>

                ${botao}
            </div>

            <p style="margin-bottom: 4px;"><strong>Tema:</strong> ${grupo.tema}</p>
            <p style="margin-bottom: 4px;"><strong>Participantes:</strong> ${ocupados}/${limite}</p>

            <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;"><strong>Alunos:</strong> ${
                grupo.alunos.length > 0
                ? grupo.alunos.map(a => a.nome).join(", ")
                : "Nenhum aluno ainda"
            }</p>

            ${alunoNoGrupo ? montarAreaAlunoGrupo(grupo, alunoNoGrupo) : ""}
        </div>
    `;
}

function fecharDetalhes() {
    document.getElementById("modalDetalhes").classList.add("escondido");
}

function abrirInscricao(trabalhoId, grupoId) {
    trabalhoSelecionado = todosTrabalhos.find(t => Number(t.id) === Number(trabalhoId));
    grupoSelecionado = trabalhoSelecionado.grupos.find(g => Number(g.id) === Number(grupoId));

    const alunoJaInscrito = trabalhoSelecionado.grupos.find(
        grupo => grupo.alunos.some(a => Number(a.id) === Number(aluno.id))
    );

    if (alunoJaInscrito) {
        alert(
            `Você já está inscrito no grupo.\n\nGrupo atual: ${alunoJaInscrito.nome}\nTema: ${alunoJaInscrito.tema}`
        );
        return;
    }

    document.getElementById("modalGrupoNome").innerText = grupoSelecionado.nome;

    const funcoes = grupoSelecionado.funcoesDisponiveis
        ? grupoSelecionado.funcoesDisponiveis
            .split("\n")
            .map(f => f.trim())
            .filter(f => f !== "")
        : [];

    document.getElementById("campoFuncaoGrupo").innerHTML = `
        <label>Função no grupo</label>
        <select id="funcaoGrupoAluno">
            <option value="">Selecione sua função</option>
            ${funcoes.map(funcao => `
                <option value="${funcao}">${funcao}</option>
            `).join("")}
        </select>
    `;

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

    const funcao = document.getElementById("funcaoGrupoAluno").value;

    if (!funcao) {
        alert("Escolha sua função no grupo.");
        return;
    }

    const resposta = await fetch(`${API}/entrar-grupo/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            alunoId: aluno.id,
            grupoId: grupoSelecionado.id,
            senha: senha,
            funcao: funcao
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
        fecharInscricao();
        await carregarTrabalhosAluno();

        if (trabalhoSelecionado) {
            abrirDetalhes(trabalhoSelecionado.id);
        }
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
        await carregarTrabalhosAluno();

        if (trabalhoSelecionado) {
            abrirDetalhes(trabalhoSelecionado.id);
        }
    }
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

    if (resultado.sucesso) {
        await carregarTrabalhosAluno();

        if (trabalhoSelecionado) {
            abrirDetalhes(trabalhoSelecionado.id);
        }
    }
}

function formatarData(data) {
    if (!data) return "";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

carregarTrabalhosAluno();