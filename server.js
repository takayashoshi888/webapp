const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const dbFilePath = path.join(__dirname, 'db.json');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Helper functions to read and write to the DB
const readDB = () => {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// --- API Routes ---

// Site Management
app.get('/api/sites', (req, res) => {
    const db = readDB();
    res.json(db.sites);
});

app.post('/api/sites', (req, res) => {
    const db = readDB();
    const newSite = { id: Date.now(), ...req.body };
    db.sites.push(newSite);
    writeDB(db);
    res.status(201).json(newSite);
});

app.put('/api/sites/:id', (req, res) => {
    const db = readDB();
    const siteIndex = db.sites.findIndex(s => s.id == req.params.id);
    if (siteIndex === -1) return res.status(404).send('Site not found');

    const updatedSite = { ...db.sites[siteIndex], ...req.body };
    db.sites[siteIndex] = updatedSite;
    writeDB(db);
    res.json(updatedSite);
});

app.delete('/api/sites/:id', (req, res) => {
    const db = readDB();
    const newSites = db.sites.filter(s => s.id != req.params.id);
    if (newSites.length === db.sites.length) return res.status(404).send('Site not found');

    db.sites = newSites;
    writeDB(db);
    res.status(204).send();
});


// User Management
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
});

app.post('/api/users', (req, res) => {
    const db = readDB();
    const newUser = { id: Date.now(), ...req.body };
    db.users.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id == req.params.id);
    if (userIndex === -1) return res.status(404).send('User not found');

    const updatedUser = { ...db.users[userIndex], ...req.body };
    db.users[userIndex] = updatedUser;
    writeDB(db);
    res.json(updatedUser);
});

app.delete('/api/users/:id', (req, res) => {
    const db = readDB();
    const newUsers = db.users.filter(u => u.id != req.params.id);
    if (newUsers.length === db.users.length) return res.status(404).send('User not found');

    db.users = newUsers;
    writeDB(db);
    res.status(204).send();
});


// Attendance Management
app.get('/api/attendances', (req, res) => {
    const db = readDB();
    res.json(db.attendances);
});

app.post('/api/attendances', (req, res) => {
    const db = readDB();
    const newAttendance = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...req.body };
    db.attendances.push(newAttendance);
    writeDB(db);
    res.status(201).json(newAttendance);
});

app.put('/api/attendances/:id', (req, res) => {
    const db = readDB();
    const attendanceIndex = db.attendances.findIndex(a => a.id == req.params.id);
    if (attendanceIndex === -1) return res.status(404).send('Attendance record not found');

    const updatedAttendance = { ...db.attendances[attendanceIndex], ...req.body };
    db.attendances[attendanceIndex] = updatedAttendance;
    writeDB(db);
    res.json(updatedAttendance);
});

app.delete('/api/attendances/:id', (req, res) => {
    const db = readDB();
    const newAttendances = db.attendances.filter(a => a.id != req.params.id);
    if (newAttendances.length === db.attendances.length) return res.status(404).send('Attendance record not found');

    db.attendances = newAttendances;
    writeDB(db);
    res.status(204).send();
});

// --- Reporting ---
app.get('/api/attendances/report', (req, res) => {
    const { year, month } = req.query; // e.g., year=2023, month=11
    if (!year || !month) {
        return res.status(400).send('Year and month query parameters are required.');
    }

    const db = readDB();
    const filteredAttendances = db.attendances.filter(att => {
        const attDate = new Date(att.date);
        return attDate.getFullYear() == year && (attDate.getMonth() + 1) == month;
    });

    if (filteredAttendances.length === 0) {
        return res.status(404).send('No records found for the selected month.');
    }

    // Convert to CSV
    const header = '日期,姓名,现场,高速费,停车费\n';
    const csvRows = filteredAttendances.map(att =>
        `${att.date},${att.userName},"${att.siteName.replace(/"/g, '""')}",${att.highwayFee},${att.parkingFee}`
    );
    const csv = header + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${year}-${month}.csv"`);
    res.send(csv);
});


// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
