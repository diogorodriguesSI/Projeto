
from django.http import JsonResponse
import json


#Alunos 

usuarios = [  
    # 1º PERÍODO

    {
        "matricula": "2024101001",
        "nome": "Lucas Almeida Santos",
        "tipo": "aluno",
        "periodo": "1",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101002",
        "nome": "Maria Eduarda Costa",
        "tipo": "aluno",
        "periodo": "1",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101003",
        "nome": "Joana Ferreira Lima",
        "tipo": "aluno",
        "periodo": "1",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101004",
        "nome": "Thiago Mendes Rocha",
        "tipo": "aluno",
        "periodo": "1",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    # 2º PERÍODO

    {
        "matricula": "2024101005",
        "nome": "José Henrique Souza",
        "tipo": "aluno",
        "periodo": "2",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101006",
        "nome": "Anderson Silva Pereira",
        "tipo": "aluno",
        "periodo": "2",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101007",
        "nome": "Sabrina Oliveira Gomes",
        "tipo": "aluno",
        "periodo": "2",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101008",
        "nome": "Carlos Eduardo Lima",
        "tipo": "aluno",
        "periodo": "2",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

  
    # 3º PERÍODO


    {
        "matricula": "2024101009",
        "nome": "Fabio Martins Rocha",
        "tipo": "aluno",
        "periodo": "3",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101010",
        "nome": "Natan Alves Costa",
        "tipo": "aluno",
        "periodo": "3",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101011",
        "nome": "Sheila Mendes Souza",
        "tipo": "aluno",
        "periodo": "3",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101012",
        "nome": "Sonia Cristina Lima",
        "tipo": "aluno",
        "periodo": "3",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },


    # 4º PERÍODO


    {
        "matricula": "2024101013",
        "nome": "Jonas Ribeiro Santos",
        "tipo": "aluno",
        "periodo": "4",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101014",
        "nome": "Otavio Ferreira Lima",
        "tipo": "aluno",
        "periodo": "4",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101015",
        "nome": "Suelen Almeida Costa",
        "tipo": "aluno",
        "periodo": "4",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101016",
        "nome": "Marta Cristina Gomes",
        "tipo": "aluno",
        "periodo": "4",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },


    # 5º PERÍODO


    {
        "matricula": "2024101136",
        "nome": "Diogo Rodrigues Pereira",
        "tipo": "aluno",
        "periodo": "5",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101070",
        "nome": "Micael Ananias Ferreira",
        "tipo": "aluno",
        "periodo": "5",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2024101040",
        "nome": "Thalles Gomes Hinsch",
        "tipo": "aluno",
        "periodo": "5",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    },

    {
        "matricula": "2023122272",
        "nome": "Vladimir Gonçalves Veiga",
        "tipo": "aluno",
        "periodo": "5",
        "curso": "Sistemas de Informação",
        "senha": "123456"
    }

]

def login(request):

    if request.method == "POST":

        dados = json.loads(request.body)

        matricula = dados.get("matricula")
        senha = dados.get("senha")

        for usuario in usuarios:

            if (
                usuario["matricula"] == matricula and
                usuario["senha"] == senha
            ):

                return JsonResponse({
                    "sucesso": True,
                    "usuario": usuario
                })

        return JsonResponse({
            "sucesso": False,
            "mensagem": "Matrícula ou senha inválida"
        }, status=401)

    return JsonResponse({
        "mensagem": "Use POST para acessar esta rota"
    })

professores = [

    {
        "matricula": "2020111100",
        "nome": "Anderson Simeão",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Probabilidade e Estatística", "periodo": "2"},
            {"nome": "Engenharia de Software e Qualidade", "periodo": "4"},
            {"nome": "Modelagem de Dados", "periodo": "4"},
            {"nome": "Lógica Matemática", "periodo": "4"},
            {"nome": "Banco de Dados", "periodo": "5"}
        ]
    },

    {
        "matricula": "2020111101",
        "nome": "André Ricardo",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Algoritmos", "periodo": "1"},
            {"nome": "Programação I", "periodo": "2"},
            {"nome": "Gestão do Conhecimento", "periodo": "3"},
            {"nome": "Programação II", "periodo": "3"},
            {"nome": "Programação em Ambiente Web", "periodo": "5"}
        ]
    },

    {
        "matricula": "2020111102",
        "nome": "Débora Amorim",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Análise e Projeto de Software", "periodo": "5"}
        ]
    },

    {
        "matricula": "2020111103",
        "nome": "Diovani Alcântara",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Administração Empresarial", "periodo": "1"},
            {"nome": "Arquitetura Empresarial", "periodo": "2"}
        ]
    },

    {
        "matricula": "2020111104",
        "nome": "Jáder Fernandes",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Computação Aplicada", "periodo": "1"}
        ]
    },

    {
        "matricula": "2020111105",
        "nome": "João Paulo Rocha",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Redes de Computadores e Infraestrutura", "periodo": "4"},
            {"nome": "Redes de Computadores, Aud. e Seg. da Informação", "periodo": "5"}
        ]
    },

    {
        "matricula": "2020111106",
        "nome": "José Eduardo",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "APTA - Meio Ambiente", "periodo": "2"},
            {"nome": "APTU - Educação das Relações Étnico-Raciais", "periodo": "3"}
        ]
    },

    {
        "matricula": "2020111107",
        "nome": "Livia Vidal",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "APTA - SI", "periodo": "1"}
        ]
    },

    {
        "matricula": "2020111108",
        "nome": "Marcelo Arantes",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Emplantação/Estrutura de Dados", "periodo": "3"}
        ]
    },

    {
        "matricula": "2020111109",
        "nome": "Maria Aparecida",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Matemática Discreta", "periodo": "1"}
        ]
    },

    {
        "matricula": "2020111110",
        "nome": "Matheus Silva",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "APTA - Direitos Humanos", "periodo": "3"}
        ]
    },

    {
        "matricula": "2020111111",
        "nome": "Myriam Kienitz",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Comportamento Digital", "periodo": "3"}
        ]
    },

    {
        "matricula": "2020111112",
        "nome": "Natália Alcântara",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "METEP", "periodo": "1"},
            {"nome": "Português Instrumental", "periodo": "1"}
        ]
    },

    {
        "matricula": "2020111113",
        "nome": "Paulo Lúcio",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Inglês Instrumental", "periodo": "2"}
        ]
    },

    {
        "matricula": "2020111114",
        "nome": "Rafael Teixeira",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Sistemas de Informação e Gerenciamento", "periodo": "2"},
            {"nome": "Sistemas Operacionais", "periodo": "5"}
        ]
    },

    {
        "matricula": "2020111115",
        "nome": "Rosenclever",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Programação III", "periodo": "3"}
        ]
    },

    {
        "matricula": "2020111116",
        "nome": "Wellingtonn Fortes",
        "tipo": "professor",
        "senha": "123456",
        "materias": [
            {"nome": "Organização de Computadores", "periodo": "2"}
        ]
    }

]