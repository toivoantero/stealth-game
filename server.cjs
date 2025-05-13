const express = require('express');
const path = require('path'); // Tarvitaan polkujen käsittelyyn
const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname))); // Olettaen, että index.html on dist-kansiossa

// Pääsivun reititys
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
