//Importations

const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/utils');
const models = require('../models');
const asyncLib = require('async');

// Regex

const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const regexPassword = /^(?=.*\d).{4,8}$/

//Routes

module.exports = {

    register: function(req, res) {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const bio = req.body.bio;

        if (email == null || username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (username.length >= 13 || username.length <= 3) {
            return res.status(400).json({ 'error': 'must be length 5 - 12' });
        }

        if (!regexEmail.test(email)) {
            return res.status(400).json({ 'error': 'invalid email' });
        }

        if (!regexPassword.test(password)) {
            return res.status(400).json({ 'error': 'invalid password' });
        }

        asyncLib.waterfall([
                //----------------On vérifie si l'utilisateur est présent dans la base de donnée---------------------//
                function(done) { // on définie done car on a pas d'arguments qui nous intéresses
                    models.User.findOne({
                            attributes: ['email'],
                            where: { email: email }
                        })
                        .then(function(userFound) {
                            done(null, userFound); // Le done est ici une fonction de callback
                        })
                        .catch(function(_err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                },
                //-----------------------------On vérifie si le status userFound existe-----------------------------//
                function(userFound, done) {
                    if (!userFound) {
                        bcrypt.hash(password, 5, function(_err, bcryptedPassword) {
                            done(null, userFound, bcryptedPassword); // Le password hasher se trouve dans la variable bcryptedPassword 
                        });
                    } else {
                        return res.status(409).json({ 'error': 'user already exist' });
                    }
                },
                //------------------------------On crée le nouvel utilisateur---------------------------------------//
                function(_userFound, bcryptedPassword, done) {
                    const newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptedPassword,
                            bio: bio,
                            isAdmin: 0
                        })
                        .then(function(newUser) {
                            done(newUser);
                        })
                        .catch(function(_err) {
                            return res.status(500).json({ 'error': 'cannot add user' });
                        });
                }
            ],
            //------------------------------------On vérifie si newUser existe--------------------------------------//
            function(newUser) {
                if (newUser) {
                    return res.status(201).json({
                        'userId': newUser.id
                    });
                } else {
                    return res.status(500).json({ 'error': 'cannot add user' });
                }
            });
    },
    login: function(req, res) {

        // Params
        const email = req.body.email;
        const password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        where: { email: email }
                    })
                    .then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(_err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function(_errBycrypt, resBycrypt) {
                        done(null, userFound, resBycrypt);
                    });
                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB' });
                }
            },
            function(userFound, resBycrypt, done) {
                if (resBycrypt) {
                    done(userFound);
                } else {
                    return res.status(403).json({ 'error': 'invalid password' });
                }
            }
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json({
                    'userId': userFound.id,
                    'token': jwtUtils.generateTokenForUser(userFound)
                });
            } else {
                return res.status(500).json({ 'error': 'cannot log on user' });
            }
        });
    },
    //----------------------------------On permet de cibler un profil en particulié----------------------------------//
    getUserProfile: function(req, res) {
        // Getting auth header
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio'],
            where: { id: userId }
        }).then(function(user) {
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
        }).catch(function(_err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
        });
    },
    //--------------------------------------------On permet de mettre à jour le profile---------------------------//
    updateUserProfile: function(req, res) {
        // Getting auth header
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params
        const bio = req.body.bio;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                        attributes: ['id', 'bio'],
                        where: { id: userId }
                    }).then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(_err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if (userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio)
                    }).then(function() {
                        done(userFound);
                    }).catch(function(_err) {
                        res.status(500).json({ 'error': 'cannot update user' });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        });
    },
    //--------------------------------------------On permet de supprimer  le profile--------------------------------//
    deleteUserProfile: function(req, res) {
        // Getting auth header
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth).userId;

        // Params

        asyncLib.waterfall([

                function(done) {
                    models.User.findOne({
                            attributes: ['id'],
                            where: { id: userId }
                        }).then(function(userFound) {
                            done(null, userFound);
                        })
                        .catch(function(_err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                },
                function(userFound, done) {
                    if (userFound) {
                        models.User.destroy({
                                where: {
                                    id: userId
                                }
                            })
                            .then(function() {
                                done(userFound);
                            }).catch(function(err) {
                                res.status(500).json({ 'error': 'cannot delete user' });
                            });
                    } else {
                        res.status(404).json({ 'error': 'user not found' });
                    }
                },
            ]
            /*, function(userFound) {
                        if (userFound) {
                            return res.status(201).json(userFound);
                        } else {
                            return res.status(500).json({ 'error': 'cannot delete user profile' });
                        }*/
        );

    }
}