from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Usuario, Materia, Trabalho, Grupo, ParticipacaoGrupo, MensagemGrupo
import json


def resposta(dados, status=200):
    response = JsonResponse(dados, status=status, safe=False)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def usuario_json(usuario):
    dados = {
        "id": usuario.id,
        "matricula": usuario.matricula,
        "nome": usuario.nome,
        "tipo": usuario.tipo,
        "periodo": usuario.periodo,
        "curso": usuario.curso,
    }

    if usuario.tipo == "professor":
        dados["materias"] = [
            {
                "id": materia.id,
                "nome": materia.nome,
                "periodo": materia.periodo,
            }
            for materia in usuario.materias.all()
        ]

    return dados


def participacao_json(p):
    return {
        "participacaoId": p.id,
        "id": p.aluno.id,
        "nome": p.aluno.nome,
        "matricula": p.aluno.matricula,
        "funcao": p.funcao or "",
        "nota": str(p.nota) if p.nota is not None else "",
        "observacao": p.observacao or "",
        "anotacaoAluno": p.anotacao_aluno or "",
        "arquivoUrl": p.arquivo.url if p.arquivo else "",
    }


def mensagem_json(m):
    return {
        "id": m.id,
        "autorId": m.autor.id,
        "autorNome": m.autor.nome,
        "autorTipo": m.autor.tipo,
        "texto": m.texto,
        "dataCriacao": m.data_criacao.strftime("%d/%m/%Y %H:%M"),
    }


def grupo_json(grupo):
    participacoes = ParticipacaoGrupo.objects.filter(grupo=grupo)
    mensagens = MensagemGrupo.objects.filter(grupo=grupo).order_by("data_criacao")

    return {
        "id": grupo.id,
        "nome": grupo.nome,
        "tema": grupo.tema,
        "limiteParticipantes": grupo.limite_participantes,
        "protegido": bool(grupo.senha),
        "funcoesDisponiveis": grupo.funcoes_disponiveis or "",
        "alunos": [participacao_json(p) for p in participacoes],
        "mensagens": [mensagem_json(m) for m in mensagens],
    }


def trabalho_json(trabalho):
    return {
        "id": trabalho.id,
        "titulo": trabalho.titulo,
        "professorNome": trabalho.professor.nome,
        "professorId": trabalho.professor.id,
        "materia": trabalho.materia.nome,
        "materiaId": trabalho.materia.id,
        "periodo": trabalho.materia.periodo,
        "dataInicio": trabalho.data_inicio.isoformat() if trabalho.data_inicio else "",
        "dataFim": trabalho.data_fim.isoformat() if trabalho.data_fim else "",
        "usarSenha": trabalho.usar_senha,
        "grupos": [grupo_json(grupo) for grupo in trabalho.grupos.all()],
    }


@csrf_exempt
def login(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    matricula = dados.get("matricula")
    senha = dados.get("senha")

    try:
        usuario = Usuario.objects.get(matricula=matricula, senha=senha)

        return resposta({
            "sucesso": True,
            "usuario": usuario_json(usuario)
        })

    except Usuario.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Matrícula ou senha inválida"
        }, 401)


@csrf_exempt
def criar_trabalho(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        professor = Usuario.objects.get(id=dados.get("professorId"))
        materia = Materia.objects.get(id=dados.get("materiaId"))

    except Usuario.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Professor não encontrado"}, 404)

    except Materia.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Matéria não encontrada"}, 404)

    trabalho = Trabalho.objects.create(
        titulo=dados.get("titulo"),
        materia=materia,
        professor=professor,
        data_inicio=dados.get("dataInicio"),
        data_fim=dados.get("dataFim"),
        usar_senha=dados.get("usarSenha", False)
    )

    quantidade_grupos = int(dados.get("quantidadeGrupos", 1))
    limite_participantes = int(dados.get("limiteParticipantes", 4))

    temas = dados.get("temas", [])
    funcoes = dados.get("funcoes", [])
    senha_grupo = dados.get("senhaGrupo", "")

    if isinstance(funcoes, list):
        funcoes_texto = "\n".join(funcoes)
    else:
        funcoes_texto = funcoes

    for i in range(quantidade_grupos):
        Grupo.objects.create(
            trabalho=trabalho,
            nome=f"Grupo {i + 1}",
            tema=temas[i] if i < len(temas) else f"Tema {i + 1}",
            limite_participantes=limite_participantes,
            senha=senha_grupo if trabalho.usar_senha else "",
            funcoes_disponiveis=funcoes_texto,
        )

    return resposta({
        "sucesso": True,
        "mensagem": "Trabalho criado com sucesso",
        "trabalho": trabalho_json(trabalho)
    })


def listar_trabalhos(request):
    periodo = request.GET.get("periodo")

    trabalhos = Trabalho.objects.all()

    if periodo:
        trabalhos = trabalhos.filter(materia__periodo=periodo)

    lista = [trabalho_json(trabalho) for trabalho in trabalhos]

    return resposta(lista)


@csrf_exempt
def detalhes_trabalho(request, trabalho_id):
    if request.method == "OPTIONS":
        return resposta({})

    try:
        trabalho = Trabalho.objects.get(id=trabalho_id)

    except Trabalho.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Trabalho não encontrado"
        }, 404)

    return resposta(trabalho_json(trabalho))


@csrf_exempt
def entrar_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    aluno_id = dados.get("alunoId")
    grupo_id = dados.get("grupoId")
    senha = dados.get("senha", "")
    funcao = dados.get("funcao", "")

    try:
        aluno = Usuario.objects.get(id=aluno_id)
        grupo = Grupo.objects.get(id=grupo_id)

    except Usuario.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Aluno não encontrado"}, 404)

    except Grupo.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Grupo não encontrado"}, 404)

    trabalho = grupo.trabalho

    grupo_ja_inscrito = Grupo.objects.filter(
        trabalho=trabalho,
        alunos=aluno
    ).first()

    if grupo_ja_inscrito:
        return resposta({
            "sucesso": False,
            "mensagem": "Você já está inscrito em um grupo desse trabalho.",
            "grupo": {
                "id": grupo_ja_inscrito.id,
                "nome": grupo_ja_inscrito.nome,
                "tema": grupo_ja_inscrito.tema
            }
        }, 400)

    if grupo.senha and grupo.senha != senha:
        return resposta({
            "sucesso": False,
            "mensagem": "Senha do grupo incorreta"
        }, 401)

    if grupo.alunos.count() >= grupo.limite_participantes:
        return resposta({
            "sucesso": False,
            "mensagem": "Grupo cheio"
        }, 400)

    grupo.alunos.add(aluno)

    ParticipacaoGrupo.objects.create(
        grupo=grupo,
        aluno=aluno,
        funcao=funcao
    )

    return resposta({
        "sucesso": True,
        "mensagem": "Você entrou no grupo com sucesso"
    })


@csrf_exempt
def sair_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    aluno_id = dados.get("alunoId")
    grupo_id = dados.get("grupoId")

    try:
        aluno = Usuario.objects.get(id=aluno_id)
        grupo = Grupo.objects.get(id=grupo_id)

    except Usuario.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Aluno não encontrado"}, 404)

    except Grupo.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Grupo não encontrado"}, 404)

    if not grupo.alunos.filter(id=aluno.id).exists():
        return resposta({
            "sucesso": False,
            "mensagem": "Você não está inscrito neste grupo"
        }, 400)

    grupo.alunos.remove(aluno)

    ParticipacaoGrupo.objects.filter(
        grupo=grupo,
        aluno=aluno
    ).delete()

    return resposta({
        "sucesso": True,
        "mensagem": "Você saiu do grupo com sucesso"
    })


@csrf_exempt
def atualizar_participacao(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        participacao = ParticipacaoGrupo.objects.get(
            id=dados.get("participacaoId")
        )

    except ParticipacaoGrupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Participação não encontrada"
        }, 404)

    participacao.funcao = dados.get("funcao", "")
    participacao.observacao = dados.get("observacao", "")

    nota = dados.get("nota")

    if nota == "" or nota is None:
        participacao.nota = None
    else:
        participacao.nota = nota

    participacao.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Dados atualizados com sucesso"
    })


@csrf_exempt
def lancar_nota(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    participacao_id = dados.get("participacaoId")
    nota = dados.get("nota")
    observacao = dados.get("observacao", "")

    try:
        participacao = ParticipacaoGrupo.objects.get(id=participacao_id)

    except ParticipacaoGrupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Participação não encontrada"
        }, 404)

    if nota == "" or nota is None:
        participacao.nota = None
    else:
        participacao.nota = nota

    participacao.observacao = observacao
    participacao.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Nota lançada com sucesso"
    })


@csrf_exempt
def remover_aluno_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        participacao = ParticipacaoGrupo.objects.get(
            id=dados.get("participacaoId")
        )

    except ParticipacaoGrupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Participação não encontrada"
        }, 404)

    grupo = participacao.grupo
    aluno = participacao.aluno

    grupo.alunos.remove(aluno)
    participacao.delete()

    return resposta({
        "sucesso": True,
        "mensagem": "Aluno removido do grupo"
    })


@csrf_exempt
def excluir_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        grupo = Grupo.objects.get(id=dados.get("grupoId"))

    except Grupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Grupo não encontrado"
        }, 404)

    grupo.delete()

    return resposta({
        "sucesso": True,
        "mensagem": "Grupo excluído com sucesso"
    })


@csrf_exempt
def editar_trabalho(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        trabalho = Trabalho.objects.get(id=dados.get("trabalhoId"))
    except Trabalho.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Trabalho não encontrado"}, 404)

    titulo = dados.get("titulo")
    data_inicio = dados.get("dataInicio")
    data_fim = dados.get("dataFim")

    if titulo:
        trabalho.titulo = titulo
    if data_inicio:
        trabalho.data_inicio = data_inicio
    if data_fim:
        trabalho.data_fim = data_fim

    trabalho.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Trabalho editado com sucesso",
        "trabalho": trabalho_json(trabalho)
    })


@csrf_exempt
def editar_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        grupo = Grupo.objects.get(id=dados.get("grupoId"))
    except Grupo.DoesNotExist:
        return resposta({"sucesso": False, "mensagem": "Grupo não encontrado"}, 404)

    nome = dados.get("nome")
    tema = dados.get("tema")
    limite = dados.get("limiteParticipantes")

    if nome:
        grupo.nome = nome
    if tema:
        grupo.tema = tema
    if limite:
        grupo.limite_participantes = int(limite)

    grupo.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Grupo editado com sucesso"
    })


@csrf_exempt
def excluir_trabalho(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        trabalho = Trabalho.objects.get(id=dados.get("trabalhoId"))

    except Trabalho.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Trabalho não encontrado"
        }, 404)

    trabalho.delete()

    return resposta({
        "sucesso": True,
        "mensagem": "Trabalho excluído com sucesso"
    })


@csrf_exempt
def adicionar_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        trabalho = Trabalho.objects.get(id=dados.get("trabalhoId"))

    except Trabalho.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Trabalho não encontrado"
        }, 404)

    numero_grupo = trabalho.grupos.count() + 1

    Grupo.objects.create(
        trabalho=trabalho,
        nome=dados.get("nome", f"Grupo {numero_grupo}"),
        tema=dados.get("tema", f"Tema {numero_grupo}"),
        limite_participantes=int(dados.get("limiteParticipantes", 4)),
        senha=dados.get("senha", ""),
        funcoes_disponiveis=dados.get("funcoes", "")
    )

    return resposta({
        "sucesso": True,
        "mensagem": "Grupo adicionado com sucesso"
    })


@csrf_exempt
def atualizar_funcoes_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    try:
        grupo = Grupo.objects.get(id=dados.get("grupoId"))

    except Grupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Grupo não encontrado"
        }, 404)

    funcoes = dados.get("funcoes", "")

    if isinstance(funcoes, list):
        funcoes = "\n".join(funcoes)

    grupo.funcoes_disponiveis = funcoes
    grupo.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Funções salvas com sucesso"
    })


@csrf_exempt
def atualizar_minha_participacao(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    aluno_id = request.POST.get("alunoId")
    grupo_id = request.POST.get("grupoId")

    try:
        participacao = ParticipacaoGrupo.objects.get(
            aluno_id=aluno_id,
            grupo_id=grupo_id
        )

    except ParticipacaoGrupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Participação não encontrada"
        }, 404)

    participacao.funcao = request.POST.get("funcao", "")
    participacao.anotacao_aluno = request.POST.get("anotacaoAluno", "")

    if request.FILES.get("arquivo"):
        participacao.arquivo = request.FILES.get("arquivo")

    participacao.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Participação salva com sucesso"
    })


@csrf_exempt
def adicionar_mensagem_grupo(request):
    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    grupo_id = dados.get("grupoId")
    autor_id = dados.get("autorId")
    texto = dados.get("texto")

    if not texto or not str(texto).strip():
        return resposta({"sucesso": False, "mensagem": "Mensagem vazia"}, 400)

    try:
        grupo = Grupo.objects.get(id=grupo_id)
        autor = Usuario.objects.get(id=autor_id)
    except (Grupo.DoesNotExist, Usuario.DoesNotExist):
        return resposta({"sucesso": False, "mensagem": "Grupo ou usuário não encontrado"}, 404)

    MensagemGrupo.objects.create(
        grupo=grupo,
        autor=autor,
        texto=str(texto).strip()
    )

    return resposta({
        "sucesso": True,
        "mensagem": "Mensagem enviada com sucesso"
    })