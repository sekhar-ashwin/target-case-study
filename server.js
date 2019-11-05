const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const products = require('./routes/ProductRoutes');

const config =  require('./config/dev.json');
const PORT = config.port || 3000;

app.get('/', (req, res) => {
    res.json("Server running!!");
});

app.use(`/products`, products);

app.listen(PORT, () => { console.log('Node server listening on port 3000'); });