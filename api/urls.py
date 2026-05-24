from django.urls import path

from .views import (
    login,
    criar_trabalho,
    listar_trabalhos,
    entrar_grupo,
    sair_grupo,
    detalhes_trabalho,
    atualizar_participacao,
    remover_aluno_grupo,
    excluir_grupo,
    excluir_trabalho,
    adicionar_grupo,
    atualizar_funcoes_grupo,
    atualizar_minha_participacao,
    lancar_nota,
)

urlpatterns = [
    path("login/", login),

    path("criar-trabalho/", criar_trabalho),
    path("trabalhos/", listar_trabalhos),
    path("trabalho/<int:trabalho_id>/", detalhes_trabalho),

    path("entrar-grupo/", entrar_grupo),
    path("sair-grupo/", sair_grupo),

    path("adicionar-grupo/", adicionar_grupo),
    path("excluir-grupo/", excluir_grupo),

    path("atualizar-participacao/", atualizar_participacao),
    path("atualizar-minha-participacao/", atualizar_minha_participacao),
    path("atualizar-funcoes-grupo/", atualizar_funcoes_grupo),

    path("remover-aluno-grupo/", remover_aluno_grupo),

    path("lancar-nota/", lancar_nota),

    path("excluir-trabalho/", excluir_trabalho),
]