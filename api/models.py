from django.db import models


# =========================
# TABELA DE USUÁRIOS
# =========================
# Aqui ficam alunos e professores
class Usuario(models.Model):

    # Define os tipos permitidos
    TIPO_CHOICES = [
        ("aluno", "Aluno"),
        ("professor", "Professor"),
    ]

    # Matrícula do usuário
    matricula = models.CharField(
        max_length=20,
        unique=True
    )

    # Nome completo
    nome = models.CharField(
        max_length=100
    )

    # Senha do usuário
    senha = models.CharField(
        max_length=100
    )

    # Tipo do usuário
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES
    )

    # Período do aluno
    # Professor não precisa
    periodo = models.CharField(
        max_length=2,
        blank=True,
        null=True
    )

    # Curso do aluno
    curso = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # Nome que aparece no admin
    def __str__(self):
        return f"{self.nome} - {self.tipo}"


# =========================
# TABELA DE MATÉRIAS
# =========================
class Materia(models.Model):

    # Nome da matéria
    nome = models.CharField(
        max_length=150
    )

    # Período da matéria
    periodo = models.CharField(
        max_length=2
    )

    # Professor responsável
    professor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="materias"
    )

    def __str__(self):
        return f"{self.nome} - {self.periodo}º período"


# =========================
# TABELA DE TRABALHOS
# =========================
class Trabalho(models.Model):

    # Título do trabalho
    titulo = models.CharField(
        max_length=150
    )

    # Matéria do trabalho
    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE
    )

    # Professor que criou
    professor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE
    )

    # Data inicial
    data_inicio = models.DateField()

    # Data final
    data_fim = models.DateField()

    # Define se grupo terá senha
    usar_senha = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.titulo


# =========================
# TABELA DE GRUPOS
# =========================
class Grupo(models.Model):

    # Trabalho do grupo
    trabalho = models.ForeignKey(
        Trabalho,
        on_delete=models.CASCADE,
        related_name="grupos"
    )

    # Nome do grupo
    nome = models.CharField(
        max_length=50
    )

    # Tema do grupo
    tema = models.CharField(
        max_length=200
    )

    # Limite de participantes
    limite_participantes = models.IntegerField()

    # Senha do grupo
    senha = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # Lista de alunos do grupo
    alunos = models.ManyToManyField(
        Usuario,
        blank=True,
        related_name="grupos_participando"
    )

    def __str__(self):
        return f"{self.nome} - {self.trabalho.titulo}"