document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the main page by looking for the attendance form
    if (document.getElementById('attendance-form')) {
        initIndexPage();
    }

    // Check for admin page
    if (document.getElementById('admin-content')) {
       initAdminPage();
    }
});

// ------------------
// ADMIN PAGE LOGIC
// ------------------

function initAdminPage() {
    // Setup CRUD sections for sites and users
    setupCrudSection('site', '现场', { name: '现场名称' });
    setupCrudSection('user', '人员', { name: '姓名' });

    // Setup Export section
    const exportBtn = document.getElementById('export-csv-btn');
    const monthInput = document.getElementById('month-select');

    // Set default value for month input to current month
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    monthInput.value = `${year}-${month}`;

    exportBtn.addEventListener('click', () => {
        const monthValue = monthInput.value;
        if (!monthValue) {
            alert('请选择一个月份');
            return;
        }
        const [selectedYear, selectedMonth] = monthValue.split('-');
        window.location.href = `/api/attendances/report?year=${selectedYear}&month=${selectedMonth}`;
    });
}

/**
 * A generic function to handle CRUD operations for a resource (e.g., site, user)
 * @param {string} resourceName - The name of the resource (e.g., 'site')
 * @param {string} resourceLabel - The display name (e.g., '现场')
 * @param {object} properties - The properties of the resource to display in the table
 */
async function setupCrudSection(resourceName, resourceLabel, properties) {
    const form = document.getElementById(`${resourceName}-form`);
    const idInput = document.getElementById(`${resourceName}-id`);
    const nameInput = document.getElementById(`${resourceName}-name`);
    const listBody = document.getElementById(`${resourceName}-list`);
    const formButton = form.querySelector('button');

    let editingId = null;

    // Load and display items
    async function loadItems() {
        const response = await fetch(`/api/${resourceName}s`);
        const items = await response.json();
        listBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}">编辑</button>
                    <button class="delete-btn" data-id="${item.id}">删除</button>
                </td>
            `;
            listBody.appendChild(row);
        });
        addEventListeners();
    }

    // Add listeners for edit/delete buttons
    function addEventListeners() {
        listBody.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = async (e) => {
                const id = e.target.dataset.id;
                if (confirm(`确定要删除这个${resourceLabel}吗?`)) {
                    await fetch(`/api/${resourceName}s/${id}`, { method: 'DELETE' });
                    await loadItems();
                }
            };
        });

        listBody.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = async (e) => {
                const id = e.target.dataset.id;
                const response = await fetch(`/api/${resourceName}s`);
                const items = await response.json();
                const item = items.find(i => i.id == id);

                if (item) {
                    nameInput.value = item.name;
                    idInput.value = item.id;
                    editingId = id;
                    formButton.textContent = `更新${resourceLabel}`;
                }
            };
        });
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const url = editingId ? `/api/${resourceName}s/${editingId}` : `/api/${resourceName}s`;
        const method = editingId ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        form.reset();
        editingId = null;
        formButton.textContent = `保存${resourceLabel}`;
        await loadItems();
    });

    // Initial load
    await loadItems();
}


// ------------------
// INDEX PAGE LOGIC
// ------------------

// Globals for index page
let sites = [];
let users = [];
let editingAttendanceId = null;

async function initIndexPage() {
    const siteSelect = document.getElementById('site-select');
    const userSelect = document.getElementById('user-select');
    const form = document.getElementById('attendance-form');
    const formButton = form.querySelector('button');

    // Fetch initial data
    await Promise.all([
        loadSites(),
        loadUsers()
    ]);

    populateSelect(siteSelect, sites, 'name');
    populateSelect(userSelect, users, 'name');

    await loadAttendances();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedSite = sites.find(s => s.id == siteSelect.value);
        const selectedUser = users.find(u => u.id == userSelect.value);

        const attendanceData = {
            userId: selectedUser.id,
            userName: selectedUser.name,
            siteId: selectedSite.id,
            siteName: selectedSite.name,
            highwayFee: parseFloat(document.getElementById('highway-fee').value),
            parkingFee: parseFloat(document.getElementById('parking-fee').value),
        };

        if (editingAttendanceId) {
            // Update existing record
            await fetch(`/api/attendances/${editingAttendanceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attendanceData)
            });
            editingAttendanceId = null;
            formButton.textContent = '出勤';
        } else {
            // Create new record
            await fetch('/api/attendances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attendanceData)
            });
        }

        form.reset();
        document.getElementById('highway-fee').value = 0;
        document.getElementById('parking-fee').value = 0;
        await loadAttendances();
    });
}

async function loadSites() {
    const response = await fetch('/api/sites');
    sites = await response.json();
}

async function loadUsers() {
    const response = await fetch('/api/users');
    users = await response.json();
}

function populateSelect(selectElement, items, property) {
    selectElement.innerHTML = ''; // Clear existing options
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item[property];
        selectElement.appendChild(option);
    });
}

async function loadAttendances() {
    const response = await fetch('/api/attendances');
    const attendances = await response.json();
    const attendanceList = document.getElementById('attendance-list');
    attendanceList.innerHTML = '';

    attendances.sort((a, b) => b.id - a.id); // Show latest first

    attendances.forEach(att => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${att.date}</td>
            <td>${att.userName}</td>
            <td>${att.siteName}</td>
            <td>${att.highwayFee.toFixed(2)}</td>
            <td>${att.parkingFee.toFixed(2)}</td>
            <td>
                <button class="edit-btn" data-id="${att.id}">编辑</button>
                <button class="delete-btn" data-id="${att.id}">删除</button>
            </td>
        `;
        attendanceList.appendChild(row);
    });

    // Add event listeners for new buttons
    addTableButtonListeners();
}

function addTableButtonListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (confirm('确定要删除这条记录吗?')) {
                await fetch(`/api/attendances/${id}`, { method: 'DELETE' });
                await loadAttendances();
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const response = await fetch('/api/attendances');
            const attendances = await response.json();
            const attendance = attendances.find(a => a.id == id);

            if (attendance) {
                document.getElementById('site-select').value = attendance.siteId;
                document.getElementById('user-select').value = attendance.userId;
                document.getElementById('highway-fee').value = attendance.highwayFee;
                document.getElementById('parking-fee').value = attendance.parkingFee;

                editingAttendanceId = id;
                document.querySelector('#attendance-form button').textContent = '更新';
                window.scrollTo(0, 0); // Scroll to top to see the form
            }
        });
    });
}
