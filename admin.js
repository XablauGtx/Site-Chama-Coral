// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const emailAdminInput = document.getElementById('email-admin');
    const senhaAdminInput = document.getElementById('senha-admin');
    const loginCard = document.getElementById('login-card');
    const btnLoginAdmin = document.getElementById('btn-login-admin');
    const authErrorMessage = document.getElementById('auth-error-message');
    const relatorioDataSelector = document.getElementById('relatorio-data-selector');
    const dataRelatorioInput = document.getElementById('dataRelatorio');
    const btnCarregarRelatorio = document.getElementById('btnCarregarRelatorio');
    const relatorioCompleto = document.getElementById('relatorio-completo');
    const dataEnsaioSpan = document.getElementById('data-ensaio');
    const totalParticipantesSpan = document.getElementById('total-participantes');
    const sopranoCountSpan = document.getElementById('soprano-count');
    const contraltoCountSpan = document.getElementById('contralto-count');
    const tenorCountSpan = document.getElementById('tenor-count');
    const baixoCountSpan = document.getElementById('baixo-count');
    const listaParticipantesAdmin = document.getElementById('lista-participantes-admin');
    const btnExportarCSV = document.getElementById('btnExportarCSV');
    const btnLogout = document.getElementById('btn-logout');

    function toggleAdminPanel(loggedIn) {
        if (loggedIn) {
            loginCard.style.display = 'none';
            relatorioDataSelector.style.display = 'block';
            relatorioCompleto.style.display = 'block';

            const hoje = new Date();
            const dia = String(hoje.getDate()).padStart(2, '0');
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const ano = hoje.getFullYear();
            const dataPadrao = `${ano}-${mes}-${dia}`;
            dataRelatorioInput.value = dataPadrao;
            carregarDados(dataPadrao);
        } else {
            loginCard.style.display = 'block';
            relatorioDataSelector.style.display = 'none';
            relatorioCompleto.style.display = 'none';
            authErrorMessage.textContent = '';
            emailAdminInput.value = '';
            senhaAdminInput.value = '';
        }
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            toggleAdminPanel(true);
        } else {
            toggleAdminPanel(false);
        }
    });

    async function entrarAdmin() {
        const email = emailAdminInput.value.trim();
        const senha = senhaAdminInput.value.trim();

        if (!email || !senha) {
            authErrorMessage.textContent = "Por favor, preencha e-mail e senha.";
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, senha);
            authErrorMessage.textContent = "";
        } catch (error) {
            console.error("Erro no login:", error);
            let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "E-mail ou senha inválidos.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Formato de e-mail inválido.";
            }
            authErrorMessage.textContent = errorMessage;
        }
    }

    async function fazerLogout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert("Ocorreu um erro ao sair. Tente novamente.");
        }
    }

    async function carregarDados(dataDesejada) {
        // Limpa a lista de participantes e mostra o cabeçalho
        listaParticipantesAdmin.innerHTML = '';
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('participante-admin-header');
        headerDiv.innerHTML = `
            <div class="col-nome">Nome</div>
            <div class="col-naipe">Naipe</div>
            <div class="col-registro">Hora de Registro</div>
            <div class="col-novo-coralista">Novo?</div> `;
        listaParticipantesAdmin.appendChild(headerDiv);

        dataEnsaioSpan.innerText = dataDesejada.split('-').reverse().join('/');

        let registrosDoDia = [];
        let sopranoCount = 0;
        let contraltoCount = 0;
        let tenorCount = 0;
        let baixoCount = 0;

        try {
            const snapshot = await db.collection('registrosChamada')
                                     .where('data', '==', dataDesejada)
                                     .orderBy('timestamp', 'asc')
                                     .get();

            if (snapshot.empty) {
                alert("Nenhum registro encontrado para essa data.");
                totalParticipantesSpan.innerText = 0;
                sopranoCountSpan.innerText = 0;
                contraltoCountSpan.innerText = 0;
                tenorCountSpan.innerText = 0;
                baixoCountSpan.innerText = 0;
                listaParticipantesAdmin.innerHTML += '<p style="text-align: center; padding: 20px; color: #555;">Nenhum participante encontrado para esta data.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const r = doc.data();
                registrosDoDia.push(r);

                switch (r.naipe) {
                    case "Soprano":
                        sopranoCount++;
                        break;
                    case "Contralto":
                        contraltoCount++;
                        break;
                    case "Tenor":
                        tenorCount++;
                        break;
                    case "Baixo":
                        baixoCount++;
                        break;
                }

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('participante-admin-item');
                // NOVO: Adicionar um div para 'col-novo-coralista'
                const isNovoCoralista = r.novoCoralista ? 'Sim' : 'Não'; // Exibe 'Sim' ou 'Não'
                itemDiv.innerHTML = `
                    <div class="col-nome">${r.nome}</div>
                    <div class="col-naipe"><span class="tag-naipe ${r.naipe.toLowerCase()}">${r.naipe}</span></div>
                    <div class="col-registro">${r.horaRegistro || 'Indefinido'}</div>
                    <div class="col-novo-coralista">${isNovoCoralista}</div> `;
                listaParticipantesAdmin.appendChild(itemDiv);
            });

            totalParticipantesSpan.innerText = registrosDoDia.length;
            sopranoCountSpan.innerText = sopranoCount;
            contraltoCountSpan.innerText = contraltoCount;
            tenorCountSpan.innerText = tenorCount;
            baixoCountSpan.innerText = baixoCount;

        } catch (error) {
            console.error("Erro ao carregar dados do Firebase: ", error);
            alert("Erro ao carregar os dados. Verifique a conexão ou as regras de segurança do Firebase.");
            totalParticipantesSpan.innerText = 0;
            sopranoCountSpan.innerText = 0;
            contraltoCountSpan.innerText = 0;
            tenorCountSpan.innerText = 0;
            baixoCountSpan.innerText = 0;
            listaParticipantesAdmin.innerHTML = '<p style="text-align: center; padding: 20px; color: #cc0000;">Erro ao carregar dados. Tente novamente.</p>';
        }
    }

    async function exportarCSV() {
        const dataParaExportar = dataRelatorioInput.value;
        if (!dataParaExportar) {
            alert("Por favor, selecione uma data para exportar.");
            return;
        }

        let registrosParaCSV = [];
        try {
            const snapshot = await db.collection('registrosChamada')
                                     .where('data', '==', dataParaExportar)
                                     .orderBy('timestamp', 'asc')
                                     .get();

            snapshot.forEach(doc => {
                registrosParaCSV.push(doc.data());
            });

        } catch (error) {
            console.error("Erro ao buscar dados para CSV: ", error);
            alert("Não foi possível buscar dados para exportar. Verifique sua conexão.");
            return;
        }

        if (registrosParaCSV.length === 0) {
            alert("Não há registros para exportar para a data selecionada.");
            return;
        }

        // NOVO: Adicionar "Novo Coralista" ao cabeçalho do CSV
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Nome,Naipe,Hora de Registro,Novo Coralista\n" // NOVO: Cabeçalho
            + registrosParaCSV.map(r => {
                const isNovoCoralista = r.novoCoralista ? 'Sim' : 'Não';
                return `${r.nome},${r.naipe},${r.horaRegistro || 'Indefinido'},${isNovoCoralista}`; // NOVO: Dados
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `presenca_${dataParaExportar}.csv`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    }

    // Event Listeners
    btnLoginAdmin.addEventListener('click', entrarAdmin);
    btnCarregarRelatorio.addEventListener('click', () => {
        const dataSelecionada = dataRelatorioInput.value;
        if (dataSelecionada) {
            carregarDados(dataSelecionada);
        } else {
            alert('Por favor, selecione uma data para carregar o relatório.');
        }
    });
    btnExportarCSV.addEventListener('click', exportarCSV);
    btnLogout.addEventListener('click', fazerLogout);
});