document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const token = localStorage.getItem('crm_token');
    const path = window.location.pathname;

    // Basic Routing
    if (path.includes('dashboard.html') && !token) {
        window.location.href = 'index.html';
        return;
    }
    if (path.includes('index.html') && token) {
        window.location.href = 'dashboard.html';
        return;
    }

    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('crm_token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    errorDiv.textContent = data.error || 'Login failed';
                }
            } catch (error) {
                errorDiv.textContent = 'Server connection error';
            }
        });
    }

    // --- Dashboard Page Logic ---
    if (path.includes('dashboard.html')) {
        let allClients = [];

        // DOM Elements
        const logoutBtn = document.getElementById('logoutBtn');
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const clientTableBody = document.getElementById('clientTableBody');
        
        // Modal Elements
        const clientModal = document.getElementById('clientModal');
        const openAddModalBtn = document.getElementById('openAddModalBtn');
        const closeBtn = document.querySelector('.close-btn');
        const clientForm = document.getElementById('clientForm');
        const modalTitle = document.getElementById('modalTitle');
        
        const notesModal = document.getElementById('notesModal');
        const closeNotesBtn = document.querySelector('.close-notes-btn');
        const notesContent = document.getElementById('notesContent');

        // Logout
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('crm_token');
            window.location.href = 'index.html';
        });

        // API Headers
        const getHeaders = () => ({
            'Authorization': `Bearer ${localStorage.getItem('crm_token')}`,
            'Content-Type': 'application/json'
        });

        // Fetch Stats
        const loadStats = async () => {
            try {
                const res = await fetch('/api/stats', { headers: getHeaders() });
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('crm_token');
                    window.location.href = 'index.html';
                    return;
                }
                const data = await res.json();
                document.getElementById('totalClients').textContent = data.totalClients || 0;
                document.getElementById('pendingCalls').textContent = data.pendingCalls || 0;
                document.getElementById('completedCalls').textContent = data.completedCalls || 0;
                document.getElementById('meetingsScheduled').textContent = data.meetingsScheduled || 0;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };

        // Render Table
        const renderTable = (clients) => {
            clientTableBody.innerHTML = '';
            clients.forEach(client => {
                const tr = document.createElement('tr');
                const meetingDateStr = client.meeting_date ? new Date(client.meeting_date).toLocaleString() : 'Not Set';
                const statusBadgeClass = client.status === 'pending' ? 'pending' : 'completed';
                
                tr.innerHTML = `
                    <td>${client.name}</td>
                    <td>${client.email || '-'}</td>
                    <td>${client.phone || '-'}</td>
                    <td>${client.business_type || '-'}</td>
                    <td><span class="status-badge ${statusBadgeClass}">${client.status}</span></td>
                    <td>${meetingDateStr}</td>
                    <td class="actions">
                        <button class="btn-icon status-${client.status}" onclick="window.toggleStatus(${client.id}, '${client.status}')" title="Toggle Status">
                            <i data-lucide="check-circle"></i>
                        </button>
                        <button class="btn-icon" onclick="window.editClient(${client.id})" title="Edit">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon" onclick="window.viewNotes(${client.id})" title="View Notes">
                            <i data-lucide="file-text"></i>
                        </button>
                        <button class="btn-icon delete" onclick="window.deleteClient(${client.id})" title="Delete">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                `;
                clientTableBody.appendChild(tr);
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        // Fetch Clients
        const loadClients = async () => {
            try {
                const res = await fetch('/api/clients', { headers: getHeaders() });
                allClients = await res.json();
                filterAndRender();
            } catch (error) {
                console.error('Error loading clients:', error);
            }
        };

        // Filter and Search
        const filterAndRender = () => {
            const query = searchInput.value.toLowerCase();
            const status = statusFilter.value;
            
            const filtered = allClients.filter(c => {
                const matchesName = c.name.toLowerCase().includes(query);
                const matchesStatus = status === 'all' || c.status === status;
                return matchesName && matchesStatus;
            });
            
            renderTable(filtered);
        };

        searchInput.addEventListener('input', filterAndRender);
        statusFilter.addEventListener('change', filterAndRender);

        // Modal Logic
        const openModal = () => clientModal.classList.add('active');
        const closeModal = () => {
            clientModal.classList.remove('active');
            clientForm.reset();
            document.getElementById('clientId').value = '';
            modalTitle.textContent = 'Add Client';
        };

        openAddModalBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        
        closeNotesBtn.addEventListener('click', () => {
            notesModal.classList.remove('active');
        });

        // Add / Edit Form Submit
        clientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('clientId').value;
            const payload = {
                name: document.getElementById('clientName').value,
                email: document.getElementById('clientEmail').value,
                phone: document.getElementById('clientPhone').value,
                business_type: document.getElementById('clientBusiness').value,
                meeting_date: document.getElementById('clientMeeting').value,
                notes: document.getElementById('clientNotes').value,
            };

            const url = id ? `/api/clients/${id}` : '/api/clients';
            const method = id ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method,
                    headers: getHeaders(),
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (!res.ok) {
                    alert(data.error || 'Error saving client');
                    return;
                }

                closeModal();
                loadStats();
                loadClients();
            } catch (error) {
                alert('Server connection error while saving client');
            }
        });

        // Global functions for inline handlers
        window.toggleStatus = async (id, currentStatus) => {
            const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
            try {
                await fetch(`/api/clients/${id}/status`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify({ status: newStatus })
                });
                loadStats();
                loadClients();
            } catch (error) {
                alert('Error updating status');
            }
        };

        window.deleteClient = async (id) => {
            if (!confirm('Are you sure you want to delete this client?')) return;
            try {
                await fetch(`/api/clients/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                loadStats();
                loadClients();
            } catch (error) {
                alert('Error deleting client');
            }
        };

        window.editClient = (id) => {
            const client = allClients.find(c => c.id === id);
            if (!client) return;

            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email || '';
            document.getElementById('clientPhone').value = client.phone || '';
            document.getElementById('clientBusiness').value = client.business_type || '';
            document.getElementById('clientNotes').value = client.notes || '';
            
            if (client.meeting_date) {
                // Format datetime for input[type="datetime-local"]
                const date = new Date(client.meeting_date);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
                document.getElementById('clientMeeting').value = localISOTime;
            } else {
                document.getElementById('clientMeeting').value = '';
            }

            modalTitle.textContent = 'Edit Client';
            openModal();
        };

        window.viewNotes = (id) => {
            const client = allClients.find(c => c.id === id);
            if (!client) return;
            notesContent.textContent = client.notes || 'No notes available for this client.';
            notesModal.classList.add('active');
        };

        // Initialize Data
        loadStats();
        loadClients();
    }
});
