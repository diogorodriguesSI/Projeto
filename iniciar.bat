@echo off
title Portal Universitario - GroupFlow

echo Verificando ambiente virtual...
if not exist venv (
    echo [!] Ambiente virtual nao encontrado. Criando um novo...
    python -m venv venv
    
    echo [!] Instalando dependencias...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    
    echo [!] Aplicando migracoes no banco de dados...
    python manage.py migrate
) else (
    echo [OK] Ambiente virtual encontrado.
    call venv\Scripts\activate.bat
)

echo.
echo Iniciando backend Django na porta 8000...
start cmd /k "call venv\Scripts\activate.bat && python manage.py runserver"

echo Iniciando servidor frontend na porta 5500...
start cmd /k "python -m http.server 5500"

echo.
echo Aguardando inicializacao dos servidores...
timeout /t 3 /nobreak >nul

echo Abrindo navegador...
start http://127.0.0.1:5500/frontend/login.html