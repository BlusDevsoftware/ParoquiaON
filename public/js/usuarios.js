async function carregarUsuarios() {
    let tentativas = 0;
    const maxTentativas = 5;
    const delay = 1000;

    while (tentativas < maxTentativas) {
        try {
            const response = await fetch(`${API_URL}/usuarios`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data && data.length > 0) {
                const tbody = document.querySelector('#tabelaUsuarios tbody');
                tbody.innerHTML = '';
                
                data.forEach(usuario => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${usuario.codigo}</td>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.tipo}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editarUsuario('${usuario.codigo}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="confirmarExclusao('${usuario.codigo}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                return;
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            tentativas++;
            if (tentativas < maxTentativas) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Não foi possível carregar os usuários após várias tentativas');
}

async function confirmarExclusao(codigo) {
    try {
        const modal = document.getElementById('modalExclusao');
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        const btnConfirmar = document.getElementById('btnConfirmarExclusao');
        const btnCancelar = document.getElementById('btnCancelarExclusao');

        const confirmarExclusao = async () => {
            try {
                const response = await fetch(`${API_URL}/usuarios/${codigo}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.message === 'Registro excluído com sucesso') {
                    modalInstance.hide();
                    await carregarUsuarios();
                    mostrarAlerta('Usuário excluído com sucesso!', 'success');
                } else {
                    throw new Error(data.message || 'Erro ao excluir usuário');
                }
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                mostrarAlerta('Erro ao excluir usuário. Por favor, tente novamente.', 'danger');
            }
        };

        btnConfirmar.onclick = confirmarExclusao;
        btnCancelar.onclick = () => modalInstance.hide();
    } catch (error) {
        console.error('Erro ao abrir modal de exclusão:', error);
        mostrarAlerta('Erro ao abrir modal de exclusão. Por favor, tente novamente.', 'danger');
    }
}

async function editarUsuario(codigo) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${codigo}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const usuario = await response.json();

        document.getElementById('editCodigo').value = usuario.codigo;
        document.getElementById('editNome').value = usuario.nome;
        document.getElementById('editEmail').value = usuario.email;
        document.getElementById('editTipo').value = usuario.tipo;

        const modal = document.getElementById('modalEditarUsuario');
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        document.getElementById('formEditarUsuario').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const formData = {
                    nome: document.getElementById('editNome').value,
                    email: document.getElementById('editEmail').value,
                    tipo: document.getElementById('editTipo').value
                };

                const response = await fetch(`${API_URL}/usuarios/${codigo}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.message === 'Registro atualizado com sucesso') {
                    modalInstance.hide();
                    await carregarUsuarios();
                    mostrarAlerta('Usuário atualizado com sucesso!', 'success');
                } else {
                    throw new Error(data.message || 'Erro ao atualizar usuário');
                }
            } catch (error) {
                console.error('Erro ao atualizar usuário:', error);
                mostrarAlerta('Erro ao atualizar usuário. Por favor, tente novamente.', 'danger');
            }
        };
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        mostrarAlerta('Erro ao carregar dados do usuário. Por favor, tente novamente.', 'danger');
    }
} 