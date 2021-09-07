// importations

const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;

// Instentiation du serveur

const server = express();

// Configuration du body parser

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Configuration des routes

server.use('/api/', apiRouter);

// Lancement du serveur
server.listen(8081, function() {
    console.log('Connexion établie!')
});