const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());

// Luo HTTP-palvelin
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Staattisten tiedostojen palveleminen
app.use(express.static(path.join(__dirname, 'dist'))); // Palvelee kaikki tiedostot juurikansiosta

// Pääsivun reititys
/*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Lähetetään index.html juurikansiosta
});
*/