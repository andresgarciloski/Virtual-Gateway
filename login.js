const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const config = {
    user: 'andres',
    password: 'Royer280504+',
    server: 'virtualazure.database.windows.net',
    database: 'virtualdb',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

async function login(username, password) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Usuarios WHERE Username = @username');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const passwordMatch = await bcrypt.compare(password, user.Password);
            if (passwordMatch) {
                return { success: true };
            } else {
                return { success: false, message: 'Invalid username or password' };
            }
        } else {
            return { success: false, message: 'Invalid username or password' };
        }
    } catch (err) {
        console.error('SQL error', err);
        return { success: false, message: 'Database error' };
    }
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await login(username, password);
    if (result.success) {
        req.session.user = username;
    }
    res.json(result);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { login };
