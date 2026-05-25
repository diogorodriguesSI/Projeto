# GroupFlow - Portal Universitário

GroupFlow é um sistema voltado para facilitar a organização, gerenciamento e divisão de trabalhos acadêmicos em grupos. Com painéis separados para **Professores** e **Alunos**, o sistema permite criação de trabalhos com limites de horários, vagas limitadas em grupos, áreas de comentários e até lançamento de notas.

## 🚀 Como testar e rodar o projeto em qualquer PC

O projeto foi configurado para ser executado de forma rápida e prática utilizando um arquivo executável, sem a necessidade de configurações complexas manuais.

### Pré-requisitos
Certifique-se de que a máquina possui **Python 3.10 ou superior** instalado.
*(Durante a instalação do Python, lembre-se de marcar a caixa **"Add Python to PATH"** se estiver no Windows).*

---

### Passo a Passo para Execução (Windows)

1. **Baixe ou clone este repositório** em sua máquina.
2. Acesse a pasta do projeto (onde está o arquivo `iniciar.bat`).
3. Dê **dois cliques no arquivo `iniciar.bat`**.

> **O que o `iniciar.bat` faz?**
> - Ele detecta automaticamente se as dependências do projeto (Django) já estão instaladas.
> - Se for a primeira vez rodando no PC, ele vai **criar o ambiente virtual (`venv`)**, instalar todas as bibliotecas necessárias contidas no `requirements.txt` e estruturar o banco de dados.
> - Em seguida, ele inicia simultaneamente o servidor backend (Django) e o servidor frontend.
> - O navegador padrão do sistema será aberto automaticamente na página de Login.

---

### Acessos para Teste (Banco de Dados Local)

Se você já possuir os dados populados em seu banco `db.sqlite3` local, pode utilizar as credenciais habituais. Caso contrário, se o sistema estiver limpo, será necessário cadastrar alunos e professores via painel admin do Django (`http://127.0.0.1:8000/admin`).

### Solução de Problemas

- **A tela do terminal abriu e fechou rapidamente:** Abra um `cmd` na pasta do projeto e rode `iniciar.bat` digitando o nome dele para conseguir ler qual erro ocorreu (geralmente é falta do Python no PATH).
- **As janelas ficaram abertas:** É normal. O `iniciar.bat` abre duas janelas de terminal (uma para o backend Django e outra para os arquivos HTML do frontend). Para desligar o sistema, basta fechar as janelas do terminal (cmd).

## Estrutura de Arquivos

- `/api` - Backend em Django contendo as regras de negócio, banco de dados (SQLite) e views.
- `/frontend` - Interface gráfica web (HTML, CSS e JS puros).
- `/media` - Arquivos físicos enviados na plataforma (como arquivos de trabalho).
- `requirements.txt` - Dependências vitais para rodar o Python/Django.
- `iniciar.bat` - Script de automação de ambiente e execução para Windows.
