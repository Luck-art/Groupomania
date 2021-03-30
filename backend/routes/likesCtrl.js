// Importations
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/utils');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes
module.exports = {
    likePost: function(req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params
        const messageId = parseInt(req.params.messageId);

        if (messageId <= 0) { // Permet de voir si l'id du message est valide ou non
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            //-----------------------------------On vérifie dans la base de donnée si notre message existe-------------------//
            function(done) {
                models.Message.findOne({
                        where: { id: messageId }
                    })
                    .then(function(messageFound) {
                        done(null, messageFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            //----------------------------------On vérifie si le message a été trouvé--------------------------------------//
            function(messageFound, done) {
                if (messageFound) {
                    models.User.findOne({
                            /* Dans le cas ou le message est trouvé on fait une requête
                                                        dans la base de donné pour récupérer l'objet utilisateur*/
                            where: { id: userId }
                        })
                        .then(function(userFound) { // l'objet sera stocké dans userfound
                            done(null, messageFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //-------------------------------------On vérifie si l'utilisateur a été trouvé-----------------------------//

            function(messageFound, userFound, done) {
                if (userFound) {
                    models.Like.findOne({
                            where: {
                                /* On vérifie si on trouve une entrée qui correspond à l'utilisateur
                                                               mais à la fois au message conçerné */
                                id: userId,
                                messageId: messageId
                            }
                        })
                        .then(function(isUserAlreadyLiked) {
                            done(null, messageFound, userFound, isUserAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'user not exist' });
                }
            },
            //-----------------------------------On vérifie si l'utilisateur na pas déjà liké--------------------------//

            function(messageFound, userFound, isUserAlreadyLiked, done) {
                if (!isUserAlreadyLiked) {
                    messageFound.addUser(userFound)
                        .then(function(alreadyLikeFound) {
                            done(null, messageFound, userFound, isUserAlreadyLiked);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set user reaction' });
                        });
                } else {
                    res.status(404).json({ 'error': 'message already liked' });
                }
            },
            //-------------------------On met à jour le message et on incrémente de un le nombre de likes--------------//
            function(messageFound, userFound, done) {
                messageFound.update({
                    likes: messageFound.likes + 1,
                }).then(function() {
                    done(messageFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update message like counter' });
                });
            },
        ], function(messageFound) {
            if (messageFound) {
                return res.status(201).json(messageFound);
            } else {
                res.status(500).json({ 'error': 'cannot update message' });
            }
        });
    },
    dislikePost: function(req, res) {

        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params
        const messageId = parseInt(req.params.messageId);

        if (messageId <= 0) { // Permet de voir si l'id du message est valide ou non
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            //-----------------------------------On vérifie dans la base de donnée si notre message existe-------------------//
            function(done) {
                models.Message.findOne({
                        where: { id: messageId }
                    })
                    .then(function(messageFound) {
                        done(null, messageFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify message' });
                    });
            },
            //----------------------------------On vérifie si le message a été trouvé--------------------------------------//
            function(messageFound, done) {
                if (messageFound) {
                    models.User.findOne({
                            where: { id: userId }
                        })
                        .then(function(userFound) {
                            done(null, messageFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            //-------------------------------------On vérifie si l'utilisateur a été trouvé-----------------------------//
            function(messageFound, userFound, done) {
                if (userFound) {
                    models.Like.findOne({
                            where: {
                                userId: userId,
                                messageId: messageId
                            }
                        })
                        .then(function(userAlreadyLikedFound) {
                            done(null, messageFound, userFound, userAlreadyLikedFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'user not exist' });
                }
            },
            //-----------------------------------On vérifie si l'utilisateur na pas déjà liké--------------------------//
            function(messageFound, userFound, userAlreadyLikedFound, done) {
                if (!userAlreadyLikedFound) {
                    messageFound.addUser(userFound, { isLike: DISLIKED })
                        .then(function(alreadyLikeFound) {
                            done(null, messageFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set user reaction' });
                        });
                } else {
                    if (userAlreadyLikedFound.isLike === LIKED) {
                        userAlreadyLikedFound.update({
                            isLike: DISLIKED,
                        }).then(function() {
                            done(null, messageFound, userFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update user reaction' });
                        });
                    } else {
                        res.status(409).json({ 'error': 'message already disliked' });
                    }
                }
            },
            //-------------------------On met à jour le message et on incrémente de un le nombre de likes--------------//
            function(messageFound, userFound, done) {
                messageFound.update({
                    likes: messageFound.likes - 1,
                }).then(function() {
                    done(messageFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update message like counter' });
                });
            },
        ], function(messageFound) {
            if (messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update message' });
            }
        });
    }
}