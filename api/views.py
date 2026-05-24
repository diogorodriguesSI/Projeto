from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Usuario, Materia, Trabalho, Grupo, ParticipacaoGrupo

import json

# Importa os models do banco
from .models import (
    Usuario,
    Materia,
    Trabalho,
    Grupo
)


# =========================================
# FUNÇÃO PADRÃO DE RESPOSTA
# =========================================
# Essa função retorna JSON e libera o frontend
def resposta(dados, status=200):

    response = JsonResponse(
        dados,
        status=status,
        safe=False
    )

    # Libera acesso do frontend
    response["Access-Control-Allow-Origin"] = "*"

    # Libera headers
    response["Access-Control-Allow-Headers"] = "Content-Type"

    # Libera métodos
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"

    return response


# =========================================
# TRANSFORMA USUÁRIO EM JSON
# =========================================
def usuario_json(usuario):

    dados = {

        "id": usuario.id,

        "matricula": usuario.matricula,

        "nome": usuario.nome,

        "tipo": usuario.tipo,

        "periodo": usuario.periodo,

        "curso": usuario.curso,
    }

    # Se for professor
    # envia também as matérias
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


# =========================================
# LOGIN
# =========================================
@csrf_exempt
def login(request):

    # Libera OPTIONS
    if request.method == "OPTIONS":
        return resposta({})

    # Só aceita POST
    if request.method != "POST":

        return resposta({

            "sucesso": False,

            "mensagem": "Use POST"

        }, 405)

    # Recebe JSON
    dados = json.loads(request.body)

    matricula = dados.get("matricula")

    senha = dados.get("senha")

    try:

        # Procura usuário no banco
        usuario = Usuario.objects.get(

            matricula=matricula,

            senha=senha
        )

        return resposta({

            "sucesso": True,

            "usuario": usuario_json(usuario)

        })

    except Usuario.DoesNotExist:

        return resposta({

            "sucesso": False,

            "mensagem": "Matrícula ou senha inválida"

        }, 401)


# =========================================
# CRIAR TRABALHO
# =========================================
@csrf_exempt
def criar_trabalho(request):

    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":

        return resposta({

            "sucesso": False,

            "mensagem": "Use POST"

        }, 405)

    # Dados enviados pelo frontend
    dados = json.loads(request.body)

    # Busca professor no banco
    professor = Usuario.objects.get(
        id=dados.get("professorId")
    )

    # Busca matéria
    materia = Materia.objects.get(
        id=dados.get("materiaId")
    )

    # Cria o trabalho
    trabalho = Trabalho.objects.create(

        titulo=dados.get("titulo"),

        materia=materia,

        professor=professor,

        data_inicio=dados.get("dataInicio"),

        data_fim=dados.get("dataFim"),

        usar_senha=dados.get(
            "usarSenha",
            False
        )
    )

    # Quantidade de grupos
    quantidade_grupos = int(
        dados.get("quantidadeGrupos")
    )

    # Máximo de alunos
    limite_participantes = int(
        dados.get("limiteParticipantes")
    )

    # Temas dos grupos
    temas = dados.get("temas", [])

    # Senha dos grupos
    senha_grupo = dados.get(
        "senhaGrupo",
        ""
    )

    # Cria grupos automaticamente
    for i in range(quantidade_grupos):

        Grupo.objects.create(

            trabalho=trabalho,

            nome=f"Grupo {i + 1}",

            tema=(
                temas[i]
                if i < len(temas)
                else f"Tema {i + 1}"
            ),

            limite_participantes=limite_participantes,

            senha=(
                senha_grupo
                if trabalho.usar_senha
                else ""
            )
        )

    return resposta({

        "sucesso": True,

        "mensagem": "Trabalho criado com sucesso"

    })


# =========================================
# LISTAR TRABALHOS
# =========================================
def listar_trabalhos(request):

    periodo = request.GET.get("periodo")

    trabalhos = Trabalho.objects.all()

    if periodo:
        trabalhos = trabalhos.filter(
            materia__periodo=periodo
        )

    lista = []

    for trabalho in trabalhos:

        lista.append({

            "id": trabalho.id,
            "titulo": trabalho.titulo,
            "professorNome": trabalho.professor.nome,
            "professorId": trabalho.professor.id,
            "materia": trabalho.materia.nome,
            "materiaId": trabalho.materia.id,
            "periodo": trabalho.materia.periodo,
            "dataInicio": str(trabalho.data_inicio),
            "dataFim": str(trabalho.data_fim),
            "usarSenha": trabalho.usar_senha,

            "grupos": [
                {
                    "id": grupo.id,
                    "nome": grupo.nome,
                    "tema": grupo.tema,
                    "limiteParticipantes": grupo.limite_participantes,
                    "funcoesDisponiveis": grupo.funcoes_disponiveis or "",

                    "alunos": [
                        {
                            "id": p.aluno.id,
                            "nome": p.aluno.nome,
                            "matricula": p.aluno.matricula,
                            "funcao": p.funcao or "",
                            "anotacaoAluno": p.anotacao_aluno or "",
                            "arquivoUrl": p.arquivo.url if p.arquivo else "",
                        }

                        for p in ParticipacaoGrupo.objects.filter(grupo=grupo)
                    ]
                }

                for grupo in trabalho.grupos.all()
            ]
        })

    return resposta(lista)

# =========================================
# ENTRAR NO GRUPO
# =========================================
@csrf_exempt
def entrar_grupo(request):

    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    aluno = Usuario.objects.get(
        id=dados.get("alunoId")
    )

    grupo = Grupo.objects.get(
        id=dados.get("grupoId")
    )

    senha = dados.get("senha", "")

    trabalho = grupo.trabalho

    # Verifica se o aluno já está em algum grupo desse mesmo trabalho
    grupo_ja_inscrito = Grupo.objects.filter(
        trabalho=trabalho,
        alunos=aluno
    ).first()

    if grupo_ja_inscrito:

        return resposta({

            "sucesso": False,

            "mensagem": "Você já está inscrito no grupo.",

            "grupo": {
                "id": grupo_ja_inscrito.id,
                "nome": grupo_ja_inscrito.nome,
                "tema": grupo_ja_inscrito.tema
            }

        }, 400)

    # Verifica senha
    if grupo.senha and grupo.senha != senha:

        return resposta({
            "sucesso": False,
            "mensagem": "Senha do grupo incorreta"
        }, 401)

    # Verifica limite
    if grupo.alunos.count() >= grupo.limite_participantes:

        return resposta({
            "sucesso": False,
            "mensagem": "Grupo cheio"
        }, 400)

    # Adiciona aluno no grupo
    grupo.alunos.add(aluno)

    ParticipacaoGrupo.objects.create(
        grupo=grupo,
        aluno=aluno
)
@csrf_exempt
def sair_grupo(request):

    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    aluno_id = dados.get("alunoId")
    grupo_id = dados.get("grupoId")

    try:
        aluno = Usuario.objects.get(id=aluno_id)
        grupo = Grupo.objects.get(id=grupo_id)

    except Usuario.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Aluno não encontrado"
        }, 404)

    except Grupo.DoesNotExist:
        return resposta({
            "sucesso": False,
            "mensagem": "Grupo não encontrado"
        }, 404)

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
def detalhes_trabalho(request, trabalho_id):

    trabalho = Trabalho.objects.get(id=trabalho_id)

    dados = {
        "id": trabalho.id,
        "titulo": trabalho.titulo,
        "materia": trabalho.materia.nome,
        "periodo": trabalho.materia.periodo,
        "professor": trabalho.professor.nome,
        "dataInicio": str(trabalho.data_inicio),
        "dataFim": str(trabalho.data_fim),
        "grupos": []
    }

    for grupo in trabalho.grupos.all():

        participacoes = ParticipacaoGrupo.objects.filter(
            grupo=grupo
        )

        dados["grupos"].append({
            "id": grupo.id,
            "nome": grupo.nome,
            "tema": grupo.tema,
            "limiteParticipantes": grupo.limite_participantes,
            "funcoesDisponiveis": grupo.funcoes_disponiveis or "",
            "alunos": [
                    {
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
                    for p in participacoes
                ]
        })

    return resposta(dados)


@csrf_exempt
def atualizar_participacao(request):

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    participacao = ParticipacaoGrupo.objects.get(
        id=dados.get("participacaoId")
    )

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
def remover_aluno_grupo(request):

    if request.method != "POST":
        return resposta({"sucesso": False, "mensagem": "Use POST"}, 405)

    dados = json.loads(request.body)

    participacao = ParticipacaoGrupo.objects.get(
        id=dados.get("participacaoId")
    )

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
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    grupo_id = dados.get("grupoId")

    try:
        grupo = Grupo.objects.get(id=grupo_id)

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
def excluir_trabalho(request):

    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    try:
        trabalho = Trabalho.objects.get(
            id=dados.get("trabalhoId")
        )

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
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    try:
        trabalho = Trabalho.objects.get(
            id=dados.get("trabalhoId")
        )

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
        senha=dados.get("senha", "")
    )

    return resposta({
        "sucesso": True,
        "mensagem": "Grupo adicionado com sucesso"
    })

@csrf_exempt
def atualizar_funcoes_grupo(request):

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    grupo = Grupo.objects.get(
        id=dados.get("grupoId")
    )

    grupo.funcoes_disponiveis = dados.get("funcoes", "")
    grupo.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Funções do grupo atualizadas com sucesso"
    })


@csrf_exempt
def atualizar_minha_participacao(request):

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    aluno_id = request.POST.get("alunoId")
    grupo_id = request.POST.get("grupoId")

    participacao = ParticipacaoGrupo.objects.get(
        aluno_id=aluno_id,
        grupo_id=grupo_id
    )

    participacao.funcao = request.POST.get("funcao", "")
    participacao.anotacao_aluno = request.POST.get("anotacaoAluno", "")

    if request.FILES.get("arquivo"):
        participacao.arquivo = request.FILES.get("arquivo")

    participacao.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Sua participação foi atualizada com sucesso"
    })

@csrf_exempt
def atualizar_funcoes_grupo(request):

    if request.method == "OPTIONS":
        return resposta({})

    if request.method != "POST":
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    dados = json.loads(request.body)

    grupo = Grupo.objects.get(
        id=dados.get("grupoId")
    )

    grupo.funcoes_disponiveis = dados.get("funcoes", "")
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
        return resposta({
            "sucesso": False,
            "mensagem": "Use POST"
        }, 405)

    aluno_id = request.POST.get("alunoId")
    grupo_id = request.POST.get("grupoId")

    participacao = ParticipacaoGrupo.objects.get(
        aluno_id=aluno_id,
        grupo_id=grupo_id
    )

    participacao.funcao = request.POST.get("funcao", "")
    participacao.anotacao_aluno = request.POST.get("anotacaoAluno", "")

    if request.FILES.get("arquivo"):
        participacao.arquivo = request.FILES.get("arquivo")

    participacao.save()

    return resposta({
        "sucesso": True,
        "mensagem": "Participação salva com sucesso"
    })