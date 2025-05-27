// chamada.js

const nomeInput = document.getElementById("nome");
const naipeSelect = document.getElementById("naipe");
const novoCoralistaCheckbox = document.getElementById("novo-coralista");
const telefoneContainer = document.getElementById("telefone-container");
const telefoneInput = document.getElementById("telefone");
const listaPresencas = document.getElementById("lista-presencas");
const dataEventoSpan = document.getElementById('data-evento'); // Certifique-se de que está definido

function getDataChave() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

async function registrarPresenca() {
    const nome = nomeInput.value.trim();
    const naipe = naipeSelect.value;
    const dataAtual = getDataChave();
    const novoCoralista = novoCoralistaCheckbox.checked;
    const telefone = novoCoralista ? telefoneInput.value.trim() : '';

    if (!nome || !naipe) {
        alert("Preencha todos os campos!");
        return;
    }

    const agora = new Date();
    const horaRegistro = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
        const snapshot = await db.collection('registrosChamada')
                                 .where('data', '==', dataAtual)
                                 .where('nome', '==', nome)
                                 .get();

        if (!snapshot.empty) {
            alert("Você já registrou sua presença para esta data com este nome!");
            nomeInput.value = "";
            naipeSelect.value = "";
            novoCoralistaCheckbox.checked = false;
            telefoneInput.value = "";
            telefoneContainer.style.display = 'none';
            return;
        }

        const registro = {
            nome: nome,
            naipe: naipe,
            horaRegistro: horaRegistro,
            data: dataAtual,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            novoCoralista: novoCoralista,
            telefone: telefone
        };

        await db.collection('registrosChamada').add(registro);
        alert("Presença registrada com sucesso!");

        nomeInput.value = "";
        naipeSelect.value = "";
        novoCoralistaCheckbox.checked = false;
        telefoneInput.value = "";
        telefoneContainer.style.display = 'none';

        carregarPresencas();
    } catch (error) {
        console.error("Erro ao registrar presença no Firebase: ", error);
        alert("Ocorreu um erro ao registrar sua presença. Tente novamente.");
    }
}

async function carregarPresencas() {
    const dataAtual = getDataChave();
    listaPresencas.innerHTML = ""; // Limpa o conteúdo existente

    try {
        const snapshot = await db.collection('registrosChamada')
                                 .where('data', '==', dataAtual)
                                 .orderBy('timestamp', 'asc')
                                 .get();

        if (snapshot.empty) {
            listaPresencas.innerHTML = '<div class="loading">⚠️ Nenhum registro ainda para hoje.</div>';
            return;
        }

        const naipesAgrupados = {
            Soprano: [],
            Contralto: [],
            Tenor: [],
            Baixo: []
        };

        snapshot.forEach(doc => {
            const r = doc.data();
            if (naipesAgrupados[r.naipe]) {
                naipesAgrupados[r.naipe].push(r);
            }
        });

        for (const naipe in naipesAgrupados) {
            const participantesDoNaipe = naipesAgrupados[naipe];

            if (participantesDoNaipe.length > 0) {
                const sectionNaipe = document.createElement("div");
                sectionNaipe.className = `naipe-section ${naipe.toLowerCase()}`;

                const headerNaipe = document.createElement("h3");
                // CORREÇÃO: Usando template literal para o texto.
                headerNaipe.textContent = `${naipe} (${participantesDoNaipe.length} participantes)`;
                sectionNaipe.appendChild(headerNaipe);

                const ul = document.createElement("ul");

                participantesDoNaipe.forEach(p => {
                    const li = document.createElement("li");
                    // ATUALIZADO: Exibe apenas o nome
                    li.textContent = `${p.nome}`;
                    ul.appendChild(li);
                });
                sectionNaipe.appendChild(ul);
                listaPresencas.appendChild(sectionNaipe);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar presenças do Firebase: ", error);
        listaPresencas.innerHTML = '<div class="loading" style="color: #cc0000;">❌ Erro ao carregar registros.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (dataEventoSpan) {
        const hoje = new Date();
        dataEventoSpan.textContent = hoje.toLocaleDateString('pt-BR');
    }
    carregarPresencas();

    novoCoralistaCheckbox.addEventListener('change', () => {
        if (novoCoralistaCheckbox.checked) {
            telefoneContainer.style.display = 'block';
        } else {
            telefoneContainer.style.display = 'none';
            telefoneInput.value = '';
        }
    });
});