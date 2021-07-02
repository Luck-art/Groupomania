// Importations
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/utils');
const { sequelize } = require('../models');

// Constants
const titleLimit = 2;
const contentLimit = 4;
const itemsLimit = 50;

// Routes
module.exports = {
    createMessage: function(req, res) {
        //return res.status(200).json({ body: req.body, headers: req.headers })
        // Authentification du header
        const headerAuth = req.headers.authorization;
        console.log(headerAuth);
        const userId = jwtUtils.getUserId(headerAuth).userId;
        console.log(userId);

        // Paramètres
        const title = req.body.title;
        const content = req.body.content;

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
                        console.log(err);
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            //---------------------------------------On s'assure que le userFound est valide---------------------------//
            function(userFound, done) {
                if (userFound) {
                    models.Message.create({
                            title: title,
                            content: content,
                            likes: 0,
                            UserId: userFound.id,
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
        const headerAuth = req.headers.authorization;
        const userId = jwtUtils.getUserId(headerAuth).userId;
        const fields = req.query.fields; // Sert à sélectionner les colonnes qu'on veux afficher
        const limit = parseInt(req.query.limit); // Permet de récupérer les messages par segmentation
        const offset = parseInt(req.query.offset); // Permet de récupérer les messages par segmentation
        const order = req.query.order; // Permet de récupérer les messages dans un ordre



        if (limit > itemsLimit) {
            limit = itemsLimit;
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
                    models.Message.findAndCountAll({ // on fait des tests sur nos attributs
                        order: [(order != null) ? order.split(':') : ['createdat', 'DESC']],
                        //attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                        limit: (!isNaN(limit)) ? limit : null,
                        offset: (!isNaN(offset)) ? offset : null,
                        include: [{ // On inclus l'implémentation direct avec la table users
                            model: models.User,
                            attributes: ['username']
                        }]



                    }).then(function(messages) {
                        console.log(messages);
                        if (messages) {
                            //done(null, messages);
                            res.status(200).json(messages);
                        } else {
                            res.status(404).json({ "error": "no messages found" });
                        }

                    }).catch(function(err) {
                        console.log(err);
                        res.status(500).json({ "error": "invalid fields" });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
            /* function(messages, done) {
                            messages.
                        }*/

            //---------------------------------------On crée le nouveau message-----------------------------------------//
        ], function(newMessage) {
            if (newMessage) {
                return res.status(201).json(newMessage);
            } else {
                return res.status(500).json({ 'error': 'cannot post message' });
            }
        });
        console.log(fields)
    },
    //---------------------------------On permet aux utilisateurs de modifier leurs messages-------------------------//
    updateMessage: function(req, res) {
        // Getting auth header
        console.log('debug updateMessage');
        const headerAuth = req.headers.authorization;
        console.log(headerAuth);
        const userId = jwtUtils.getUserId(headerAuth).userId;
        console.log(userId);

        // Params
        const id = req.params.id;
        const title = req.body.title;
        const content = req.body.content;

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    attributes: ['id', 'title', 'content'],
                    where: { id }
                }).then(function(userFound) {
                    console.log(userFound);
                    done(null, userFound);
                })

                .catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    userFound.update({
                        title: (title ? title : userFound.title),
                        content: (content ? content : userFound.content),
                    }).then(function() {
                        //console.log(userFound);
                        done(userFound);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': 'cannot update message' });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user message' });
            }
        });
    },
    //-------------------------------On permet aux utilisateurs de supprimer leurs/les messages-------------------------//
    deleteMessage: function(req, res) {
        // Getting auth header
        console.log('debug deleteMessage');
        const headerAuth = req.headers.authorization;
        console.log(headerAuth);
        const userId = jwtUtils.getUserId(headerAuth).userId;
        console.log(userId);

        // Params
        const id = req.params.id

        asyncLib.waterfall([

            function(done) {
                models.User.findOne({
                        attributes: ['id'],
                        where: { id: userId }
                    }).then(function(userFound) {
                        console.log(userFound);
                        done(null, userFound);
                    })
                    .catch(function() {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                console.log(id);
                models.Message.findOne({
                        where: { id }
                    }).then(function(messageFound) {
                        const data = { userFound, messageFound };
                        done(null, data);
                    })
                    .catch(function() {
                        return res.status(500).json({ 'error': 'unable to find message' });
                    });
            },
            function(data, done) {
                let canDelete = false;
                if (userId === data.messageFound.UserId) {
                    canDelete = true;
                } else {
                    if (data.userFound.isAdmin === true) {
                        canDelete = true;
                    } else {
                        return res.status(403).json({ 'error': 'You are not an administrator !' });
                    }
                }

                if (canDelete === true) {
                    data.messageFound.destroy({ where: { id } })
                        .then(function(messageFound) {
                            done(messageFound);
                        })
                        .catch(function() {
                            return res.status(500).json({ 'error': 'unable to delete message !' });
                        });
                }

            }
        ], function(messageFound) {
            if (messageFound) {
                return res.status(204).json({ message: 'Message successfully deleted' });
            } else {
                return res.status(500).json({ 'error': 'cannot delete user message' });
            }
        });
    },
}