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
    atualizar_funcoes_grupo,
    atualizar_minha_participacao,
)

urlpatterns = [
    path("login/", login),
    path("criar-trabalho/", criar_trabalho),
    path("trabalhos/", listar_trabalhos),
    path("entrar-grupo/", entrar_grupo),
    path("sair-grupo/", sair_grupo),
    path("excluir-grupo/", excluir_grupo),

    path("trabalho/<int:trabalho_id>/", detalhes_trabalho),
    path("atualizar-participacao/", atualizar_participacao),
    path("remover-aluno-grupo/", remover_aluno_grupo),
    path("excluir-trabalho/", excluir_trabalho),
    path("adicionar-grupo/", adicionar_grupo),
    path("atualizar-funcoes-grupo/", atualizar_funcoes_grupo),
    path("atualizar-minha-participacao/", atualizar_minha_participacao),
    path("atualizar-funcoes-grupo/", atualizar_funcoes_grupo),
    path("atualizar-minha-participacao/", atualizar_minha_participacao),
]