const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false // Change to false to avoid creating sessions for unauthenticated users
}));

// Azure SQL Database configuration
const dbConfig = {
    user: 'andres',
    password: 'Royer280504+',
    server: 'virtualazure.database.windows.net',
    database: 'virtualdb',
    options: {
        encrypt: true // Use encryption
    }
};

// Connect to the database
sql.connect(dbConfig, async err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'andres' && password === 'admin') {
        req.session.user = { username: 'andres', role: 'admin' }; // Store username and role in session
        res.json({ success: true });
    } else {
        console.log('Invalid username or password');
        res.json({ success: false });
    }
});

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        res.redirect('/login.html');
    }
}

// Route to check authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Handle form submission
app.post('/submit-form', async (req, res) => {
    const { nombre, email, telefono, destino, fecha_viaje, comentarios } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO Contactos (Nombre, Email, Telefono, Destino, FechaViaje, Comentarios)
            VALUES (@nombre, @Email, @Telefono, @Destino, @FechaViaje, @Comentarios)
        `);
        res.redirect('/Contactanos.html?success=true');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.redirect('/Contactanos.html?success=false');
    }
});

// Protected route to view reservations
app.get('/ver-contactos', isAuthenticated, async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM Contactos');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error al obtener la información');
    }
});

// Serve static files (your HTML, CSS, JS files)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});