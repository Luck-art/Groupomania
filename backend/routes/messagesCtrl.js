// Importations
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/utils');

// Constants
const titleLimit = 2;
const contentLimit = 4;
const itemsLimit = 50;

// Routes
module.exports = {
    createMessage: function(req, res) {
        // Authentification du header
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Paramètres
        const title = req.body.title;
        const content = req.body.content;

        const obj = {
                title,
                content,
                title_length: title.length,
                content_length: content.length,
            }
            //return res.status(201).json(obj);

        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (title.length <= titleLimit || content.length <= contentLimit) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            //--------------------------------------On récupère l'utilisateur dans la base de donnée-------------------//
            function(done) {
                models.User.findOne({
                        where: { id: userId }
                    })
                    .then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            //---------------------------------------On s'assure que le userFound est valide---------------------------//
            function(userFound, done) {
                if (userFound) {
                    console.log(title);
                    console.log(content);
                    models.Message.create({
                            title: title,
                            content: content,
                            likes: 0,
                            UserId: userFound.id
                        })
                        .then(function(newMessage) {
                            done(newMessage);
                        });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            }
            //---------------------------------------On crée le nouveau message-----------------------------------------//
        ], function(newMessage) {
            if (newMessage) {
                return res.status(201).json(newMessage);
            } else {
                return res.status(500).json({ 'error': 'cannot post message' });
            }
        });
    },
    listMessage: function(req, res) { // On liste tous les messages
        const fields = req.query.fields; // Sert à sélectionner les colonnes qu'on veux afficher
        const limit = parseInt(req.query.limit); // Permet de récupérer les messages par segmentation
        const offset = parseInt(req.query.offset); // Permet de récupérer les messages par segmentation
        const order = req.query.order; // Permet de récupérer les messages dans un ordre

        if (limit > itemsLimit) {
            limit = itemsLimit;
        }
        models.Message.findAll({ // on fait des tests sur nos attributs
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{ // On inclus l'implémentation direct avec la table users
                model: models.User,
                attributes: ['username']
            }]

        }).then(function(messages) {
            if (messages) {
                res.status(200).json(messages);
            } else {
                res.status(404).json({ "error": "no messages found" });
            }

        }).catch(function(err) {
            console.log(err);
            res.status(500).json({ "error": "invalid fields" });
        });
    }
}