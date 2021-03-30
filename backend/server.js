// importations

const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;

// Instentiation du serveur

const server = express();

// Configuration du body parser

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Configuration des routes

server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('Test');
});

server.use('/api/', apiRouter);

// Lancement du serveur
server.listen(8080, function() {
    console.log('Connexion établie!')
});