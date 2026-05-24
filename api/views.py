from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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

    # Pega período enviado
    periodo = request.GET.get("periodo")

    # Busca todos trabalhos
    trabalhos = Trabalho.objects.all()

    # Filtra por período
    if periodo:

        trabalhos = trabalhos.filter(
            materia__periodo=periodo
        )

    lista = []

    # Percorre todos trabalhos
    for trabalho in trabalhos:

        lista.append({

            "id": trabalho.id,

            "titulo": trabalho.titulo,

            "professorNome": trabalho.professor.nome,

            "professorId": trabalho.professor.id,

            "materia": trabalho.materia.nome,

            "materiaId": trabalho.materia.id,

            "periodo": trabalho.materia.periodo,

            "dataInicio": str(
                trabalho.data_inicio
            ),

            "dataFim": str(
                trabalho.data_fim
            ),

            "usarSenha": trabalho.usar_senha,

            # Lista grupos
            "grupos": [

                {

                    "id": grupo.id,

                    "nome": grupo.nome,

                    "tema": grupo.tema,

                    "limiteParticipantes":
                    grupo.limite_participantes,

                    # Lista alunos do grupo
                    "alunos": [

                        {

                            "id": aluno.id,

                            "nome": aluno.nome,

                            "matricula":
                            aluno.matricula

                        }

                        for aluno
                        in grupo.alunos.all()
                    ]

                }

                for grupo
                in trabalho.grupos.all()
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

    # Recebe JSON
    dados = json.loads(request.body)

    # Busca aluno
    aluno = Usuario.objects.get(
        id=dados.get("alunoId")
    )

    # Busca grupo
    grupo = Grupo.objects.get(
        id=dados.get("grupoId")
    )

    senha = dados.get("senha", "")

    # Verifica senha do grupo
    if grupo.senha and grupo.senha != senha:

        return resposta({

            "sucesso": False,

            "mensagem":
            "Senha do grupo incorreta"

        }, 401)

    # Verifica limite
    if grupo.alunos.count() >= grupo.limite_participantes:

        return resposta({

            "sucesso": False,

            "mensagem": "Grupo cheio"

        }, 400)

    # Verifica se já entrou
    if grupo.alunos.filter(id=aluno.id).exists():

        return resposta({

            "sucesso": False,

            "mensagem":
            "Você já está nesse grupo"

        }, 400)

    # Adiciona aluno no grupo
    grupo.alunos.add(aluno)

    return resposta({

        "sucesso": True,

        "mensagem":
        "Você entrou no grupo com sucesso"

    })