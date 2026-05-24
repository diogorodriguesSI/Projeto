@echo off
title Portal Universitario

echo Iniciando backend Django...
start cmd /k "python manage.py runserver"

echo Iniciando frontend...
start cmd /k "python -m http.server 5500"

echo Abrindo navegador...
start http://127.0.0.1:5500/frontend/login.html