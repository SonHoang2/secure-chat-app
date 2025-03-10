import sequelize from '../db.js';
import { DataTypes } from 'sequelize';

const Conversation = sequelize.define('conversation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
    },
    isGroup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    avatar: {
        type: DataTypes.STRING,
    },
},
    {
        timestamps: false
    }
);

Conversation.associate = (db) => {
    Conversation.hasMany(db.Message, {
        foreignKey: {
            name: 'conversationId'
        }
    });

    Conversation.hasMany(db.ConvParticipant, {
        foreignKey: {
            name: 'conversationId'
        },
        onDelete: 'CASCADE'
    });
}

export default Conversation;