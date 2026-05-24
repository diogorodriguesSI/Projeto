from django.urls import path

from .views import (
    login,
    criar_trabalho,
    listar_trabalhos,
    entrar_grupo,
    sair_grupo
)

urlpatterns = [
    path("login/", login),
    path("criar-trabalho/", criar_trabalho),
    path("trabalhos/", listar_trabalhos),
    path("entrar-grupo/", entrar_grupo),
    path("sair-grupo/", sair_grupo),
]