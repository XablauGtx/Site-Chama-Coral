// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const authSection = document.getElementById('auth-section');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutBtn = document.getElementById('logout-btn');

    const partituraForm = document.getElementById('partitura-form');
    const partituraIdInput = document.getElementById('partitura-id');
    const tituloInput = document.getElementById('titulo');
    const compositorInput = document.getElementById('compositor');
    const instrumentoInput = document.getElementById('instrumento');
    const generoInput = document.getElementById('genero');
    const descricaoInput = document.getElementById('descricao');
    const precoInput = document.getElementById('preco');
    const linkCarrinhoInput = document.getElementById('link_carrinho');
    const imagemCapaUrlInput = document.getElementById('imagem_capa_url');
    const savePartituraBtn = document.getElementById('save-partitura-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formMessage = document.getElementById('form-message');
    const partiturasTableBody = document.querySelector('#partituras-table tbody');

    let editingPartituraId = null; // Para controlar se estamos editando ou adicionando

    // --- Autenticação ---
    // Verifica o estado da autenticação ao carregar a página
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário logado
            authSection.style.display = 'none';
            adminContent.style.display = 'block';
            loadPartituras(); // Carrega as partituras após o login
        } else {
            // Usuário não logado
            authSection.style.display = 'block';
            adminContent.style.display = 'none';
        }
    });

    // Evento de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginErrorMessage.textContent = ''; // Limpa mensagem de erro
        } catch (error) {
            console.error("Erro no login:", error.message);
            loginErrorMessage.textContent = `Erro no login: ${error.message}`;
        }
    });

    // Evento de logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Erro ao fazer logout:", error.message);
        }
    });

    // --- Funções CRUD do Firestore ---

    // Carregar Partituras
    const loadPartituras = async () => {
        partiturasTableBody.innerHTML = '<tr><td colspan="5">Carregando partituras...</td></tr>';
        try {
            const snapshot = await db.collection('partituras').orderBy('titulo').get();
            partiturasTableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
            snapshot.forEach(doc => {
                const partitura = doc.data();
                const row = partiturasTableBody.insertRow();
                row.insertCell(0).textContent = partitura.titulo;
                row.insertCell(1).textContent = partitura.compositor || 'N/A';
                row.insertCell(2).textContent = `R$ ${partitura.preco.toFixed(2)}`;
                
                const linkCell = row.insertCell(3);
                const linkAnchor = document.createElement('a');
                linkAnchor.href = partitura.link_carrinho;
                linkAnchor.textContent = partitura.link_carrinho;
                linkAnchor.target = '_blank';
                linkCell.appendChild(linkAnchor);


                const actionsCell = row.insertCell(4);
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit-btn';
                editButton.addEventListener('click', () => editPartitura(doc.id, partitura));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.className = 'delete-btn';
                deleteButton.addEventListener('click', () => deletePartitura(doc.id));

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
            });
        } catch (error) {
            console.error("Erro ao carregar partituras:", error.message);
            partiturasTableBody.innerHTML = '<tr><td colspan="5" style="color: red;">Erro ao carregar partituras.</td></tr>';
        }
    };

    // Adicionar/Atualizar Partitura
    partituraForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const partituraData = {
            titulo: tituloInput.value,
            compositor: compositorInput.value || '',
            instrumento: instrumentoInput.value || '',
            genero: generoInput.value || '',
            descricao: descricaoInput.value,
            preco: parseFloat(precoInput.value),
            imagem_capa_url: imagemCapaUrlInput.value
        };

        try {
            if (editingPartituraId) {
                // Atualizar
                await db.collection('partituras').doc(editingPartituraId).update(partituraData);
                formMessage.textContent = 'Partitura atualizada com sucesso!';
            } else {
                // Adicionar
                await db.collection('partituras').add(partituraData);
                formMessage.textContent = 'Partitura adicionada com sucesso!';
            }
            partituraForm.reset(); // Limpa o formulário
            editingPartituraId = null; // Reseta o estado de edição
            savePartituraBtn.textContent = 'Adicionar Partitura';
            cancelEditBtn.style.display = 'none';
            loadPartituras(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao salvar partitura:", error.message);
            formMessage.textContent = `Erro ao salvar partitura: ${error.message}`;
            formMessage.style.color = 'red';
        }
        setTimeout(() => formMessage.textContent = '', 3000); // Limpa a mensagem após 3 segundos
    });

    // Função para preencher o formulário para edição
    const editPartitura = (id, partitura) => {
        editingPartituraId = id;
        tituloInput.value = partitura.titulo;
        compositorInput.value = partitura.compositor || '';
        instrumentoInput.value = partitura.instrumento || '';
        generoInput.value = partitura.genero || '';
        descricaoInput.value = partitura.descricao;
        precoInput.value = partitura.preco;
        imagemCapaUrlInput.value = partitura.imagem_capa_url;

        savePartituraBtn.textContent = 'Atualizar Partitura';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo do formulário
    };

    // Cancela a edição
    cancelEditBtn.addEventListener('click', () => {
        partituraForm.reset();
        editingPartituraId = null;
        savePartituraBtn.textContent = 'Adicionar Partitura';
        cancelEditBtn.style.display = 'none';
        formMessage.textContent = '';
    });

    // Deletar Partitura
    const deletePartitura = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta partitura?')) {
            try {
                await db.collection('partituras').doc(id).delete();
                alert('Partitura excluída com sucesso!');
                loadPartituras(); // Recarrega a lista
            } catch (error) {
                console.error("Erro ao excluir partitura:", error.message);
                alert(`Erro ao excluir partitura: ${error.message}`);
            }
        }
    };

    // Chamada inicial para carregar partituras (se já estiver logado)
    // A chamada está dentro de onAuthStateChanged agora.
});