'use strict';
module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
        //--------------------------------------------Références vers le modèle message et la clé id----------------------//
        messageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Message',
                key: 'id'
            }
        },
        //--------------------------------------------Références vers le modèle user et la clé id----------------------//
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        isLike: DataTypes.INTEGER
    }, {});
    //-----------------------Ici, on fait une relation entre la table users & messages en passant par Like-----------//

    Like.associate = function(models) {
        models.User.belongsToMany(models.Message, {
            through: models.Like,
            foreignKey: 'userId', // Clé étrangère
            otherKey: 'messageId', // Clé étrangère
        });

        models.Message.belongsToMany(models.User, {
            through: models.Like,
            foreignKey: 'messageId',
            otherKey: 'userId',
        });

        //--------------------Ici, on fait le lien entre les clés étrangères et la table de référence-------------------//

        models.Like.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user', // alias
        });

        models.Like.belongsTo(models.Message, {
            foreignKey: 'messageId',
            as: 'message', // alias
        });

    };
    return Like;
};