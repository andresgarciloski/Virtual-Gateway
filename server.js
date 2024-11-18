const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

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
sql.connect(dbConfig, err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Handle form submission
app.post('/submit-form', async (req, res) => {
    const { nombre, email, telefono, destino, fecha_viaje, comentarios } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO Contactos (Nombre, Email, Telefono, Destino, FechaViaje, Comentarios)
            VALUES ('${nombre}', '${email}', '${telefono}', '${destino}', '${fecha_viaje}', '${comentarios}')
        `);
        res.send('Información enviada correctamente');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error al enviar la información');
    }
});

// Serve static files (your HTML, CSS, JS files)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});