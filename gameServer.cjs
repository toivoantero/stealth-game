const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
let helmet = require('helmet');

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
app.use(cors());

// Luo HTTP-palvelin
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Staattisten tiedostojen palveleminen (esim. index.html, index.js, jne.)
app.use(express.static(path.join(__dirname)));
  
