const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
const saltRounds = 10;
const jwtSecret = 'your_jwt_secret';
let helmet = require('helmet');

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('pelivalikko.db', (error) => {
    if (error) {
        console.log(error.message);
        // Palauta virhe jos tietokantaa ei voida avata
        throw error;
    }
});

// Luo HTTP-palvelin
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Staattisten tiedostojen palveleminen (esim. index.html, index.js, jne.)
app.use(express.static(path.join(__dirname, 'dist')));

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Määrittele API-reititykset
app.get('/api/seikkailija/all', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM seikkailija WHERE pel_id = ?', [userId], (error, result) => {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }
        return res.status(200).json(result);
    });
});

app.get('/api/pelaaja/all', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM pelaajatili WHERE id = ?', [userId], (error, result) => {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }
        return res.status(200).json(result);
    });
});

app.get('/api/varusteet/all', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM varusteet WHERE pel_id = ?', [userId], (error, result) => {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }
        return res.status(200).json(result);
    });
});

app.get('/api/seikkailija/one/:id', (req, res) => {
    let id = req.params.id;

    db.get('select * from seikkailija where id = ?', [id], (error, result) => {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }
        if (typeof (result) == 'undefined') {
            return res.status(404).json({ message: 'Haettua seikkailijaa ei ole' });
        }
        return res.status(200).json(result);
    });
});

app.get('/api/seikkailija/kuvat', (req, res) => {
    db.all('select kuva from seikkailija where kuva IS NOT NULL', (error, result) => {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }
        return res.status(200).json(result);
    });
});

app.delete('/api/seikkailija/delete/:id', (req, res) => {
    let id = req.params.id;

    db.run('delete from seikkailija where id = ?', [id], function (error) {
        if (error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message });
        }

        if (this.changes === 0) {
            console.log('Ei poistettavaa');
            return res.status(404).json({ message: 'Ei poistettavaa seikkailijaa' });
        }

        return res.status(200).json({ count: this.changes });
    });
});

// seikkailijan muokkaus
app.put('/api/seikkailija/update/:id', (req, res) => {
    const { id } = req.params;
    const { nimi, ammatti, kokemuspisteet, ika, ase, kuva } = req.body;

    if (!nimi || !ammatti || !kokemuspisteet || !ika) {
        return res.status(400).json({ message: "Kaikki kentät ovat pakollisia!" });
    }

    const sql = `UPDATE seikkailija 
                 SET nimi = ?, ammatti = ?, kokemuspisteet = ?, ika = ?, ase = ?, kuva = ?
                 WHERE id = ?`;

    const params = [nimi, ammatti, kokemuspisteet, ika, ase, kuva, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Tietokantavirhe." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "seikkailijaa ei löytynyt." });
        }

        res.json({ message: "seikkailija päivitetty onnistuneesti!" });
    });
});

// Varusteiden muokkaus
app.put('/api/varusteet/update/:id', (req, res) => {
    const { id } = req.params;
    const { nimi, vahinko, paino, hinta, tyyppi, omistaja } = req.body;

    if (!nimi || !vahinko || !paino || !hinta || !tyyppi || !omistaja) {
        return res.status(400).json({ message: "Kaikki kentät ovat pakollisia!" });
    }

    const sql = `UPDATE varusteet 
                 SET nimi = ?, vahinko = ?, paino = ?, hinta = ?, tyyppi = ?, omistaja = ?
                 WHERE id = ?`;

    const params = [nimi, vahinko, paino, hinta, tyyppi, omistaja, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Tietokantavirhe." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Varusteita ei löytynyt." });
        }

        res.json({ message: "Varusteet päivitetty onnistuneesti!" });
    });
});

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './kuvat'); // Mihin kansioon ladataan
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);  // Millä tiedostonimellä
    }
});

const upload = multer({ storage: storage })
/*
app.post('/api/seikkailija/add', (req, res) => {
    // Lisää uusi seikkailija tietokantaan
    const { nimi, ammatti, ika, kokemuspisteet, ase } = req.body;
    db.run('INSERT INTO seikkailija (nimi, ammatti, ika, kokemuspisteet, ase) VALUES (?, ?, ?, ?, ?)',
        [nimi, ammatti, ika, kokemuspisteet, ase],
        (error) => {
            if (error) {
                console.log(error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            return res.status(201).json({ message: 'seikkailija lisätty onnistuneesti' });
        }
    );
});
*/
app.post('/api/seikkailija/add', authenticateJWT, upload.single('kuva'), (req, res) => {
    const seikkailija = req.body;
    const userId = req.user.id;

    db.run(
        'INSERT INTO seikkailija (pel_id, nimi, ammatti, ika, kokemuspisteet, ase, kuva) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, seikkailija.nimi, seikkailija.ammatti, seikkailija.ika, seikkailija.kokemuspisteet, seikkailija.ase, seikkailija.kuva],
        (error) => {
            if (error) {
                console.log(error.message);
                return res.status(400).json({ message: error.message });
            }
            return res.status(200).json({ count: 1 });
        }
    );
});

app.get('/api/lataa/:nimi', (req, res) => {
    let file = './kuvat/' + req.params.nimi;
    res.download(file);
});

app.get('*', (req, res) => {
    return res.status(404).json({ message: 'Ei pyydettyä palvelua' });
});

// Käsittely virheille
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Rekisteröinti
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (username.length < 4 || password.length < 4) {
        return res.status(400).json({ error: 'Username and password must be at least 4 characters long' });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    db.run('INSERT INTO pelaajatili (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        // Haetaan juuri luodun pelaajatilin id
        const playerId = this.lastID;

        // Lisätään oletusvarusteet pelaajalle
        const defaultVarusteet = [
            { pel_id: playerId, sei_id: 1, nimi: 'Hopeatikari', vahinko: 13, paino: 1, hinta: 95, tyyppi: 'Yhden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Gladius', vahinko: 33, paino: 9, hinta: 129, tyyppi: 'Yhden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Vastakaarijousi', vahinko: 21, paino: 2, hinta: 87, tyyppi: 'Kahden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Paimensauva', vahinko: 11, paino: 3, hinta: 15, tyyppi: 'Kahden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Claymore', vahinko: 51, paino: 15, hinta: 160, tyyppi: 'Kahden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Rapiiri', vahinko: 20, paino: 2, hinta: 100, tyyppi: 'Yhden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Kivi', vahinko: 5, paino: 2, hinta: 1, tyyppi: 'Yhden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Hilpari', vahinko: 42, paino: 10, hinta: 90, tyyppi: 'Kahden käden', omistaja: 'pelaaja' },
            { pel_id: playerId, sei_id: 1, nimi: 'Savupommi', vahinko: 10, paino: 3, hinta: 90, tyyppi: 'Yhden käden', omistaja: 'kauppa' },
            { pel_id: playerId, sei_id: 1, nimi: 'Pronssimiekka', vahinko: 30, paino: 9, hinta: 80, tyyppi: 'Yhden käden', omistaja: 'kauppa' },
            { pel_id: playerId, sei_id: 1, nimi: 'Paimenen linko', vahinko: 7, paino: 1, hinta: 5, tyyppi: 'Kahden käden', omistaja: 'kauppa' },
            { pel_id: playerId, sei_id: 1, nimi: 'Pronssitikari', vahinko: 11, paino: 1, hinta: 45, tyyppi: 'Yhden käden', omistaja: 'kauppa' }
        ];

        // Lisätään varusteet tietokantaan
        const insertVaruste = db.prepare('INSERT INTO varusteet (pel_id, sei_id, nimi, vahinko, paino, hinta, tyyppi, omistaja) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const varuste of defaultVarusteet) {
            insertVaruste.run([varuste.pel_id, varuste.sei_id, varuste.nimi, varuste.vahinko, varuste.paino, varuste.hinta, varuste.tyyppi, varuste.omistaja]);
        }
        insertVaruste.finalize();

        // Palautetaan onnistumisviesti
        res.status(201).json({ message: 'User created and default items added' });
    });
});

// Kirjautuminen
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM pelaajatili WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        console.log(`Is password valid: ${isPasswordValid}`);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    });
});
  
