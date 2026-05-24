async function fazerLogin(){

    const matricula =
        document.getElementById("matricula").value

    const senha =
        document.getElementById("senha").value

    const resposta = await fetch(
        "http://127.0.0.1:8000/api/login/",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                matricula:matricula,
                senha:senha
            })
        }
    )

    const dados = await resposta.json()

    console.log(dados)

    if(dados.sucesso){

        // - Verifica se é aluno
        if(dados.usuario.tipo == "aluno"){

            window.location.href = "aluno.html"
        }

        // - Verifica se é professor
        else{

            window.location.href = "professor.html"
        }

    }else{

        document.getElementById("mensagem")
        .innerText = "Login inválido"
    }

}