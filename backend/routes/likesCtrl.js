// Imports
const models = require('../models');
const jwtUtils = require('../utils/utils');
const asyncLib = require('async');
const { sequelize } = require('../models');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes
module.exports = {
    likePost: function(req, res) {
        console.log('debug likeMessage');
        // Getting auth header
        const headerAuth = req.headers.authorization;
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params
        const id = req.params.id;

        if (id <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                        where: { id }
                    })
                    .then(function(messageFound) {
                        done(null, messageFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify message' });
                    });
            },
            function(messageFound, done) {
                if (messageFound) {
                    models.User.findOne({
                            where: { id: userId }
                        })
                        .then(function(userFound) {
                            const data = { userFound, messageFound };
                            done( null, data);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    return res.status(404).json({ 'error': 'message not found !' });
                }
            },
            function(data, done) {
                if (data.userFound) {
                    models.Like.findOne({
                            where: {
                                userId: userId,
                                messageId: id
                            }
                        })
                        .then(function(likeFound) {
                            if (likeFound !== null) {
                                likeFound.update({
                                    isLike: 1,
                                }).then(function() {
                                    return res.status(200).json(likeFound);
                                }).catch(function(err) {
                                    return res.status(500).json({ 'error': 'cannot update message like counter' });
                                });
                                
                            }
                            done(null, data);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    return res.status(404).json({ 'error': 'user not exist' });
                }
            },
            function(data, done) {
                console.log(data);
                data.messageFound.update({
                    likes: data.messageFound.likes + 1,
                }).then(function() {
                    done(null, data);
                }).catch(function(err) {
                    return res.status(500).json({ 'error': 'cannot update message like counter' });
                });
            },
            function(data, done) {
                if (data) {
                    models.Like.create({
                            isLike: 1,
                            userId: data.userFound.id,
                            messageId: data.messageFound.id
                            //UserId: userFound.id,
                        })
                        .then(function(newLike) {
                            done(newLike);
                        });
                } else {
                    res.status(404).json({ 'error': 'can t update isLike' });
                }
            },
        ], function(messageFound) {
            if (messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update message' });
            }
        });
    },
    dislikePost: function(req, res) {
        console.log('debug likeMessage');
        // Getting auth header
        const headerAuth = req.headers.authorization;
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params
        const id = req.params.id;

        if (id <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                        where: { id }
                    })
                    .then(function(messageFound) {
                        done(null, messageFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify message' });
                    });
            },
            function(messageFound, done) {
                if (messageFound) {
                    models.User.findOne({
                            where: { id: userId }
                        })
                        .then(function(userFound) {
                            const data = { userFound, messageFound };
                            done( null, data);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    return res.status(404).json({ 'error': 'message not found !' });
                }
            },
            function(data, done) {
                if (data.userFound) {
                    models.Like.findOne({
                            where: {
                                userId: userId,
                                messageId: id
                            }
                        })
                        .then(function(likeFound) {
                            if (likeFound === null) {
                                return res.status(404).json({ 'error': 'like not found' });
                            }
                            data.likeFound = likeFound
                            done(null, data);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    return res.status(404).json({ 'error': 'user not exist' });
                }
            },
            function(data, done) {
                data.messageFound.update({
                    likes: data.messageFound.likes - 1,
                }).then(function() {
                    done(null, data);
                }).catch(function(err) {
                    return res.status(500).json({ 'error': 'cannot update message like counter' });
                });
            },
            function(data, done) {
                data.likeFound.update({
                    isLike: 0,
                }).then(function() {
                    done(data);
                }).catch(function(err) {
                    return res.status(500).json({ 'error': 'cannot update message like counter' });
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