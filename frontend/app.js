// Configuración
const API_BASE = 'http://localhost:8000';

// Utilidades
function showMessage(message, type = 'error') {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;
    setTimeout(() => msgDiv.className = 'message', 5000);
}

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (getToken()) {
        config.headers.Authorization = `Bearer ${getToken()}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Error en la solicitud');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Autenticación
async function login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Error en login');
    }

    setToken(data.access_token);
    return data;
}

async function register(userData) {
    return await apiCall('/api/usuarios/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function logout() {
    try {
        await apiCall('/api/usuarios/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    removeToken();
    redirectToLogin();
}

// Datos
async function loadCryptos() {
    return await apiCall('/api/criptomonedas');
}

async function loadWallets() {
    return await apiCall('/api/wallets/mi-perfil/mis-wallets');
}

async function loadTransactions() {
    return await apiCall('/api/transacciones/mi-perfil/mis-transacciones');
}

async function createWallet(walletData) {
    return await apiCall('/api/wallets', {
        method: 'POST',
        body: JSON.stringify(walletData)
    });
}

async function createTransaction(transactionData) {
    return await apiCall('/api/transacciones', {
        method: 'POST',
        body: JSON.stringify(transactionData)
    });
}

// APIs adicionales para funcionalidades avanzadas
async function getUserProfile() {
    return await apiCall('/api/usuarios/profile/me');
}

async function updateUser(userId, userData) {
    return await apiCall(`/api/usuarios/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

async function deleteUser(userId) {
    return await apiCall(`/api/usuarios/${userId}`, {
        method: 'DELETE'
    });
}

async function getAllUsers() {
    return await apiCall('/api/usuarios');
}

async function getUserById(userId) {
    return await apiCall(`/api/usuarios/${userId}`);
}

async function getAllWallets() {
    return await apiCall('/api/wallets');
}

async function getWalletById(walletId) {
    return await apiCall(`/api/wallets/${walletId}`);
}

async function updateWallet(walletId, walletData) {
    return await apiCall(`/api/wallets/${walletId}`, {
        method: 'PUT',
        body: JSON.stringify(walletData)
    });
}

async function deleteWallet(walletId) {
    return await apiCall(`/api/wallets/${walletId}`, {
        method: 'DELETE'
    });
}

async function getWalletsByUser(userId) {
    return await apiCall(`/api/wallets/usuario/${userId}`);
}

async function getAllTransactions() {
    return await apiCall('/api/transacciones');
}

async function getTransactionById(transactionId) {
    return await apiCall(`/api/transacciones/${transactionId}`);
}

async function updateTransaction(transactionId, transactionData) {
    return await apiCall(`/api/transacciones/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(transactionData)
    });
}

async function deleteTransaction(transactionId) {
    return await apiCall(`/api/transacciones/${transactionId}`, {
        method: 'DELETE'
    });
}

async function changeTransactionStatus(transactionId, status) {
    return await apiCall(`/api/transacciones/${transactionId}/estado`, {
        method: 'PATCH',
        body: JSON.stringify(status)
    });
}

async function getTransactionsByUser(userId) {
    return await apiCall(`/api/transacciones/usuario/${userId}`);
}

async function getCryptoById(cryptoId) {
    return await apiCall(`/api/criptomonedas/${cryptoId}`);
}

async function createCrypto(cryptoData) {
    return await apiCall('/api/criptomonedas', {
        method: 'POST',
        body: JSON.stringify(cryptoData)
    });
}

async function deleteCrypto(cryptoId) {
    return await apiCall(`/api/criptomonedas/${cryptoId}`, {
        method: 'DELETE'
    });
}

// UI Updates
function renderWallets(wallets) {
    const container = document.getElementById('wallets-list');
    container.innerHTML = '';

    if (wallets.length === 0) {
        container.innerHTML = '<p>No tienes wallets aún.</p>';
        return;
    }

    wallets.forEach(wallet => {
        const item = document.createElement('div');
        item.className = 'wallet-item';
        item.innerHTML = `
            <div>
                <strong>${wallet.cryptomoneda?.nombre || 'N/A'}</strong>
                <br>Dirección: ${wallet.direccion_wallet}
            </div>
        `;
        container.appendChild(item);
    });
}

function renderTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';

    if (transactions.length === 0) {
        container.innerHTML = '<p>No tienes transacciones aún.</p>';
        return;
    }

    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div>
                <strong>${transaction.tipo}</strong> - ${transaction.cryptomoneda?.nombre || 'N/A'}
                <br>Cantidad: ${transaction.cantidad}
                <br>Precio: $${transaction.precio_unitario || 0}
                <br>Estado: ${transaction.estado}
            </div>
        `;
        container.appendChild(item);
    });
}

function renderCryptos(cryptos) {
    const container = document.getElementById('cryptos-list');
    container.innerHTML = '';

    cryptos.forEach(crypto => {
        const item = document.createElement('div');
        item.className = 'crypto-item';
        item.innerHTML = `
            <div>
                <strong>${crypto.nombre}</strong> (${crypto.simbolo})
                <br>Red: ${crypto.red || 'N/A'}
                <br>Precio: $${crypto.valor_usd || 'N/A'}
            </div>
            <div>
                <button class="btn" onclick="viewCrypto(${crypto.id})">Ver</button>
                <button class="btn" onclick="deleteCrypto(${crypto.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderProfile(user) {
    const container = document.getElementById('profile-info');
    container.innerHTML = `
        <div class="profile-card">
            <h3>${user.first_name} ${user.last_name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Usuario:</strong> ${user.username}</p>
            <p><strong>Estado:</strong> ${user.is_active ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Fecha de registro:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        </div>
    `;
}

function renderUsers(users) {
    const container = document.getElementById('users-list');
    container.innerHTML = '';

    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <div>
                <strong>${user.first_name} ${user.last_name}</strong>
                <br>Email: ${user.email}
                <br>Usuario: ${user.username}
                <br>Estado: ${user.is_active ? 'Activo' : 'Inactivo'}
            </div>
            <div>
                <button class="btn" onclick="viewUser(${user.id})">Ver</button>
                <button class="btn" onclick="editUser(${user.id})">Editar</button>
                <button class="btn" onclick="deleteUser(${user.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderAllWallets(wallets) {
    const container = document.getElementById('all-wallets-list');
    container.innerHTML = '';

    wallets.forEach(wallet => {
        const item = document.createElement('div');
        item.className = 'wallet-item';
        item.innerHTML = `
            <div>
                <strong>${wallet.cryptomoneda?.nombre || 'N/A'}</strong>
                <br>Dirección: ${wallet.direccion_wallet}
                <br>Usuario: ${wallet.usuario?.username || 'N/A'}
                <br>Balance: ${wallet.balance || 0}
            </div>
            <div>
                <button class="btn" onclick="viewWallet(${wallet.id})">Ver</button>
                <button class="btn" onclick="editWallet(${wallet.id})">Editar</button>
                <button class="btn" onclick="deleteWallet(${wallet.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderAllTransactions(transactions) {
    const container = document.getElementById('all-transactions-list');
    container.innerHTML = '';

    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div>
                <strong>${transaction.tipo}</strong> - ${transaction.cryptomoneda?.nombre || 'N/A'}
                <br>Cantidad: ${transaction.cantidad}
                <br>Precio: $${transaction.precio_unitario || 0}
                <br>Usuario: ${transaction.usuario?.username || 'N/A'}
                <br>Estado: ${transaction.estado}
            </div>
            <div>
                <button class="btn" onclick="viewTransaction(${transaction.id})">Ver</button>
                <button class="btn" onclick="editTransaction(${transaction.id})">Editar</button>
                <button class="btn" onclick="changeStatus(${transaction.id})">Cambiar Estado</button>
                <button class="btn" onclick="deleteTransaction(${transaction.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderAdminCryptos(cryptos) {
    const container = document.getElementById('admin-cryptos-list');
    container.innerHTML = '';

    cryptos.forEach(crypto => {
        const item = document.createElement('div');
        item.className = 'crypto-item';
        item.innerHTML = `
            <div>
                <strong>${crypto.nombre}</strong> (${crypto.simbolo})
                <br>Red: ${crypto.red || 'N/A'}
                <br>Precio: $${crypto.valor_usd || 'N/A'}
            </div>
            <div>
                <button class="btn" onclick="viewCrypto(${crypto.id})">Ver</button>
                <button class="btn" onclick="editCrypto(${crypto.id})">Editar</button>
                <button class="btn" onclick="deleteCrypto(${crypto.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function populateCryptoSelect() {
    const selects = document.querySelectorAll('#crypto-select, #transaction-crypto');
    selects.forEach(async (select) => {
        try {
            const cryptos = await loadCryptos();
            select.innerHTML = '<option value="">Seleccionar...</option>';
            cryptos.forEach(crypto => {
                const option = document.createElement('option');
                option.value = crypto.id;
                option.textContent = `${crypto.nombre} (${crypto.simbolo})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cryptos:', error);
        }
    });
}

function populateWalletSelects() {
    const selects = document.querySelectorAll('#source-wallet, #dest-wallet');
    selects.forEach(async (select) => {
        try {
            const wallets = await loadWallets();
            select.innerHTML = '<option value="">Seleccionar...</option>';
            wallets.forEach(wallet => {
                const option = document.createElement('option');
                option.value = wallet.id;
                option.textContent = `${wallet.cryptomoneda?.nombre || 'N/A'} - ${wallet.direccion_wallet}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading wallets:', error);
        }
    });
}

// Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login/Register page
    if (document.getElementById('login-form')) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await login(email, password);
                redirectToDashboard();
            } catch (error) {
                showMessage(error.message);
            }
        });

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                email: document.getElementById('register-email').value,
                username: document.getElementById('register-username').value,
                first_name: document.getElementById('register-firstname').value,
                last_name: document.getElementById('register-lastname').value,
                password: document.getElementById('register-password').value
            };

            try {
                await register(userData);
                showMessage('Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
                loginTab.click();
            } catch (error) {
                showMessage(error.message);
            }
        });
    }

    // Dashboard page
    if (document.querySelector('.navbar')) {
        if (!getToken()) {
            redirectToLogin();
            return;
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-links a:not(#logout), .dropdown-menu a');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);

                // Remove active class from all links
                document.querySelectorAll('.nav-links a, .dropdown-menu a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === target) {
                        section.classList.add('active');
                    }
                });

                loadSectionData(target);
            });
        });

        document.getElementById('logout').addEventListener('click', logout);

        // Modals
        const walletModal = document.getElementById('wallet-modal');
        const transactionModal = document.getElementById('transaction-modal');

        document.getElementById('add-wallet-btn').addEventListener('click', () => {
            populateCryptoSelect();
            walletModal.style.display = 'block';
        });

        document.getElementById('add-transaction-btn').addEventListener('click', () => {
            populateCryptoSelect();
            populateWalletSelects();
            transactionModal.style.display = 'block';
        });

        // Profile modal
        document.getElementById('edit-profile-btn').addEventListener('click', async () => {
            try {
                const profile = await getUserProfile();
                document.getElementById('profile-email').value = profile.email;
                document.getElementById('profile-username').value = profile.username;
                document.getElementById('profile-firstname').value = profile.first_name;
                document.getElementById('profile-lastname').value = profile.last_name;
                profileModal.style.display = 'block';
            } catch (error) {
                showMessage('Error cargando perfil: ' + error.message);
            }
        });

        // Crypto modals
        document.getElementById('add-crypto-btn').addEventListener('click', () => {
            document.getElementById('crypto-modal-title').textContent = 'Agregar Criptomoneda';
            document.getElementById('crypto-form').reset();
            cryptoModal.style.display = 'block';
        });

        document.getElementById('add-crypto-admin-btn').addEventListener('click', () => {
            document.getElementById('crypto-modal-title').textContent = 'Agregar Criptomoneda';
            document.getElementById('crypto-form').reset();
            cryptoModal.style.display = 'block';
        });

        const closeButtons = document.querySelectorAll('.close');
        const profileModal = document.getElementById('profile-modal');
        const cryptoModal = document.getElementById('crypto-modal');
        const userModal = document.getElementById('user-modal');
        const statusModal = document.getElementById('status-modal');

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                walletModal.style.display = 'none';
                transactionModal.style.display = 'none';
                profileModal.style.display = 'none';
                cryptoModal.style.display = 'none';
                userModal.style.display = 'none';
                statusModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === walletModal || e.target === transactionModal ||
                e.target === profileModal || e.target === cryptoModal ||
                e.target === userModal || e.target === statusModal) {
                walletModal.style.display = 'none';
                transactionModal.style.display = 'none';
                profileModal.style.display = 'none';
                cryptoModal.style.display = 'none';
                userModal.style.display = 'none';
                statusModal.style.display = 'none';
            }
        });

        // Forms
        document.getElementById('wallet-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const walletData = {
                cryptomoneda_id: parseInt(document.getElementById('crypto-select').value),
                direccion_wallet: document.getElementById('wallet-address').value
            };

            try {
                await createWallet(walletData);
                walletModal.style.display = 'none';
                loadSectionData('wallets');
                showMessage('Wallet creada exitosamente', 'success');
            } catch (error) {
                showMessage(error.message);
            }
        });

        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const transactionData = {
                tipo: document.getElementById('transaction-type').value,
                cryptomoneda_id: parseInt(document.getElementById('transaction-crypto').value),
                cantidad: parseFloat(document.getElementById('transaction-amount').value),
                precio_unitario: parseFloat(document.getElementById('transaction-price').value),
                wallet_origen_id: document.getElementById('source-wallet').value ? parseInt(document.getElementById('source-wallet').value) : null,
                wallet_destino_id: document.getElementById('dest-wallet').value ? parseInt(document.getElementById('dest-wallet').value) : null,
                direccion_destino: document.getElementById('dest-address').value
            };

            try {
                await createTransaction(transactionData);
                transactionModal.style.display = 'none';
                loadSectionData('transactions');
                showMessage('Transacción creada exitosamente', 'success');
            } catch (error) {
                showMessage(error.message);
            }
        });

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const profileData = {
                email: document.getElementById('profile-email').value,
                username: document.getElementById('profile-username').value,
                first_name: document.getElementById('profile-firstname').value,
                last_name: document.getElementById('profile-lastname').value
            };

            try {
                const profile = await getUserProfile();
                await updateUser(profile.id, profileData);
                profileModal.style.display = 'none';
                loadSectionData('profile');
                showMessage('Perfil actualizado exitosamente', 'success');
            } catch (error) {
                showMessage('Error actualizando perfil: ' + error.message);
            }
        });

        // Crypto form
        document.getElementById('crypto-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cryptoData = {
                nombre: document.getElementById('crypto-name').value,
                simbolo: document.getElementById('crypto-symbol').value,
                red: document.getElementById('crypto-network').value,
                valor_usd: parseFloat(document.getElementById('crypto-price').value) || null
            };

            try {
                await createCrypto(cryptoData);
                cryptoModal.style.display = 'none';
                loadSectionData('cryptos');
                loadSectionData('admin-cryptos');
                showMessage('Criptomoneda creada exitosamente', 'success');
            } catch (error) {
                showMessage('Error creando criptomoneda: ' + error.message);
            }
        });

        // User form
        document.getElementById('user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                email: document.getElementById('user-email').value,
                username: document.getElementById('user-username').value,
                first_name: document.getElementById('user-firstname').value,
                last_name: document.getElementById('user-lastname').value
            };

            try {
                const userId = document.getElementById('user-form').dataset.userId;
                await updateUser(userId, userData);
                userModal.style.display = 'none';
                loadSectionData('admin-users');
                showMessage('Usuario actualizado exitosamente', 'success');
            } catch (error) {
                showMessage('Error actualizando usuario: ' + error.message);
            }
        });

        // Status form
        document.getElementById('status-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = { estado: document.getElementById('status-select').value };

            try {
                const transactionId = document.getElementById('status-form').dataset.transactionId;
                await changeTransactionStatus(transactionId, newStatus);
                statusModal.style.display = 'none';
                loadSectionData('admin-transactions');
                showMessage('Estado de transacción actualizado', 'success');
            } catch (error) {
                showMessage('Error cambiando estado: ' + error.message);
            }
        });

        // Load initial data
        loadDashboardData();
        loadSectionData('dashboard');
    }
});

async function loadDashboardData() {
    try {
        const [wallets, transactions] = await Promise.all([loadWallets(), loadTransactions()]);
        document.getElementById('total-wallets').textContent = wallets.length;
        document.getElementById('total-transactions').textContent = transactions.length;
        // Calcular balance total (simplificado)
        const totalBalance = transactions.reduce((sum, t) => {
            if (t.estado === 'completed') {
                return sum + (t.cantidad * (t.precio_unitario || 0));
            }
            return sum;
        }, 0);
        document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadSectionData(section) {
    try {
        switch (section) {
            case 'profile':
                const profile = await getUserProfile();
                renderProfile(profile);
                break;
            case 'wallets':
                const wallets = await loadWallets();
                renderWallets(wallets);
                break;
            case 'transactions':
                const transactions = await loadTransactions();
                renderTransactions(transactions);
                break;
            case 'cryptos':
                const cryptos = await loadCryptos();
                renderCryptos(cryptos);
                break;
            case 'admin-users':
                const users = await getAllUsers();
                renderUsers(users);
                break;
            case 'admin-wallets':
                const allWallets = await getAllWallets();
                renderAllWallets(allWallets);
                break;
            case 'admin-transactions':
                const allTransactions = await getAllTransactions();
                renderAllTransactions(allTransactions);
                break;
            case 'admin-cryptos':
                const adminCryptos = await loadCryptos();
                renderAdminCryptos(adminCryptos);
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        showMessage(`Error cargando ${section}: ${error.message}`);
    }
}

// Funciones globales para botones
async function editWallet(id) {
    try {
        const wallet = await getWalletById(id);
        // Aquí se podría abrir un modal de edición
        showMessage('Funcionalidad de edición de wallet próximamente');
    } catch (error) {
        showMessage('Error obteniendo wallet: ' + error.message);
    }
}

async function deleteWallet(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta wallet?')) {
        try {
            await deleteWallet(id);
            loadSectionData('wallets');
            loadSectionData('admin-wallets');
            showMessage('Wallet eliminada exitosamente', 'success');
        } catch (error) {
            showMessage('Error eliminando wallet: ' + error.message);
        }
    }
}

async function viewTransaction(id) {
    try {
        const transaction = await getTransactionById(id);
        alert(`Transacción ${id}:\nTipo: ${transaction.tipo}\nCripto: ${transaction.cryptomoneda?.nombre}\nCantidad: ${transaction.cantidad}\nEstado: ${transaction.estado}`);
    } catch (error) {
        showMessage('Error obteniendo transacción: ' + error.message);
    }
}

async function viewUser(id) {
    try {
        const user = await getUserById(id);
        alert(`Usuario ${id}:\nNombre: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nUsuario: ${user.username}\nEstado: ${user.is_active ? 'Activo' : 'Inactivo'}`);
    } catch (error) {
        showMessage('Error obteniendo usuario: ' + error.message);
    }
}

async function editUser(id) {
    try {
        const user = await getUserById(id);
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-firstname').value = user.first_name;
        document.getElementById('user-lastname').value = user.last_name;
        document.getElementById('user-form').dataset.userId = id;
        userModal.style.display = 'block';
    } catch (error) {
        showMessage('Error obteniendo usuario: ' + error.message);
    }
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        try {
            await deleteUser(id);
            loadSectionData('admin-users');
            showMessage('Usuario eliminado exitosamente', 'success');
        } catch (error) {
            showMessage('Error eliminando usuario: ' + error.message);
        }
    }
}

async function viewWallet(id) {
    try {
        const wallet = await getWalletById(id);
        alert(`Wallet ${id}:\nDirección: ${wallet.direccion_wallet}\nCripto: ${wallet.cryptomoneda?.nombre}\nUsuario: ${wallet.usuario?.username}\nBalance: ${wallet.balance || 0}`);
    } catch (error) {
        showMessage('Error obteniendo wallet: ' + error.message);
    }
}

async function editTransaction(id) {
    try {
        const transaction = await getTransactionById(id);
        // Aquí se podría abrir un modal de edición
        showMessage('Funcionalidad de edición de transacción próximamente');
    } catch (error) {
        showMessage('Error obteniendo transacción: ' + error.message);
    }
}

async function changeStatus(id) {
    document.getElementById('status-form').dataset.transactionId = id;
    statusModal.style.display = 'block';
}

async function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        try {
            await deleteTransaction(id);
            loadSectionData('transactions');
            loadSectionData('admin-transactions');
            showMessage('Transacción eliminada exitosamente', 'success');
        } catch (error) {
            showMessage('Error eliminando transacción: ' + error.message);
        }
    }
}

async function viewCrypto(id) {
    try {
        const crypto = await getCryptoById(id);
        alert(`Criptomoneda ${id}:\nNombre: ${crypto.nombre}\nSímbolo: ${crypto.simbolo}\nRed: ${crypto.red || 'N/A'}\nPrecio: $${crypto.valor_usd || 'N/A'}`);
    } catch (error) {
        showMessage('Error obteniendo criptomoneda: ' + error.message);
    }
}

async function editCrypto(id) {
    try {
        const crypto = await getCryptoById(id);
        document.getElementById('crypto-modal-title').textContent = 'Editar Criptomoneda';
        document.getElementById('crypto-name').value = crypto.nombre;
        document.getElementById('crypto-symbol').value = crypto.simbolo;
        document.getElementById('crypto-network').value = crypto.red || '';
        document.getElementById('crypto-price').value = crypto.valor_usd || '';
        // Aquí se podría implementar la edición
        showMessage('Funcionalidad de edición de criptomonedas próximamente');
    } catch (error) {
        showMessage('Error obteniendo criptomoneda: ' + error.message);
    }
}

async function deleteCrypto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta criptomoneda?')) {
        try {
            await deleteCrypto(id);
            loadSectionData('cryptos');
            loadSectionData('admin-cryptos');
            showMessage('Criptomoneda eliminada exitosamente', 'success');
        } catch (error) {
            showMessage('Error eliminando criptomoneda: ' + error.message);
        }
    }
}