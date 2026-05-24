from api.models import Usuario, Materia


# Limpa o banco antes de cadastrar de novo
Materia.objects.all().delete()
Usuario.objects.all().delete()


alunos = [
    ["2024101001", "Lucas Almeida Santos", "1"],
    ["2024101002", "Maria Eduarda Costa", "1"],
    ["2024101003", "Joana Ferreira Lima", "1"],
    ["2024101004", "Thiago Mendes Rocha", "1"],

    ["2024101005", "José Henrique Souza", "2"],
    ["2024101006", "Anderson Silva Pereira", "2"],
    ["2024101007", "Sabrina Oliveira Gomes", "2"],
    ["2024101008", "Carlos Eduardo Lima", "2"],

    ["2024101009", "Fabio Martins Rocha", "3"],
    ["2024101010", "Natan Alves Costa", "3"],
    ["2024101011", "Sheila Mendes Souza", "3"],
    ["2024101012", "Sonia Cristina Lima", "3"],

    ["2024101013", "Jonas Ribeiro Santos", "4"],
    ["2024101014", "Otavio Ferreira Lima", "4"],
    ["2024101015", "Suelen Almeida Costa", "4"],
    ["2024101016", "Marta Cristina Gomes", "4"],

    ["2024101136", "Diogo Rodrigues Pereira", "5"],
    ["2024101070", "Micael Ananias Ferreira", "5"],
    ["2024101040", "Thalles Gomes Hinsch", "5"],
    ["2023122272", "Vladimir Gonçalves Veiga", "5"],
]


for matricula, nome, periodo in alunos:
    Usuario.objects.create(
        matricula=matricula,
        nome=nome,
        senha="123456",
        tipo="aluno",
        periodo=periodo,
        curso="Sistemas de Informação"
    )


professores = [
    {
        "matricula": "2020111100",
        "nome": "Anderson Simeão",
        "materias": [
            ["Probabilidade e Estatística", "2"],
            ["Engenharia de Software e Qualidade", "4"],
            ["Modelagem de Dados", "4"],
            ["Lógica Matemática", "4"],
            ["Banco de Dados", "5"],
        ]
    },
    {
        "matricula": "2020111101",
        "nome": "André Ricardo",
        "materias": [
            ["Algoritmos", "1"],
            ["Programação I", "2"],
            ["Gestão do Conhecimento", "3"],
            ["Programação II", "3"],
            ["Programação em Ambiente Web", "5"],
        ]
    },
    {
        "matricula": "2020111102",
        "nome": "Débora Amorim",
        "materias": [
            ["Análise e Projeto de Software", "5"],
        ]
    },
    {
        "matricula": "2020111103",
        "nome": "Diovani Alcântara",
        "materias": [
            ["Administração Empresarial", "1"],
            ["Arquitetura Empresarial", "2"],
        ]
    },
    {
        "matricula": "2020111104",
        "nome": "Jáder Fernandes",
        "materias": [
            ["Computação Aplicada", "1"],
        ]
    },
    {
        "matricula": "2020111105",
        "nome": "João Paulo Rocha",
        "materias": [
            ["Redes de Computadores e Infraestrutura", "4"],
            ["Redes de Computadores, Aud. e Seg. da Informação", "5"],
        ]
    },
    {
        "matricula": "2020111106",
        "nome": "José Eduardo",
        "materias": [
            ["APTA - Meio Ambiente", "2"],
            ["APTU - Educação das Relações Étnico-Raciais", "3"],
        ]
    },
    {
        "matricula": "2020111107",
        "nome": "Livia Vidal",
        "materias": [
            ["APTA - SI", "1"],
        ]
    },
    {
        "matricula": "2020111108",
        "nome": "Marcelo Arantes",
        "materias": [
            ["Emplantação/Estrutura de Dados", "3"],
        ]
    },
    {
        "matricula": "2020111109",
        "nome": "Maria Aparecida",
        "materias": [
            ["Matemática Discreta", "1"],
        ]
    },
    {
        "matricula": "2020111110",
        "nome": "Matheus Silva",
        "materias": [
            ["APTA - Direitos Humanos", "3"],
        ]
    },
    {
        "matricula": "2020111111",
        "nome": "Myriam Kienitz",
        "materias": [
            ["Comportamento Digital", "3"],
        ]
    },
    {
        "matricula": "2020111112",
        "nome": "Natália Alcântara",
        "materias": [
            ["METEP", "1"],
            ["Português Instrumental", "1"],
        ]
    },
    {
        "matricula": "2020111113",
        "nome": "Paulo Lúcio",
        "materias": [
            ["Inglês Instrumental", "2"],
        ]
    },
    {
        "matricula": "2020111114",
        "nome": "Rafael Teixeira",
        "materias": [
            ["Sistemas de Informação e Gerenciamento", "2"],
            ["Sistemas Operacionais", "5"],
        ]
    },
    {
        "matricula": "2020111115",
        "nome": "Rosenclever",
        "materias": [
            ["Programação III", "3"],
        ]
    },
    {
        "matricula": "2020111116",
        "nome": "Wellingtonn Fortes",
        "materias": [
            ["Organização de Computadores", "2"],
        ]
    },
]


for prof in professores:
    professor = Usuario.objects.create(
        matricula=prof["matricula"],
        nome=prof["nome"],
        senha="123456",
        tipo="professor"
    )

    for materia_nome, periodo in prof["materias"]:
        Materia.objects.create(
            nome=materia_nome,
            periodo=periodo,
            professor=professor
        )


print("Banco populado com sucesso!")
print("Total de alunos:", len(alunos))
print("Total de professores:", len(professores))