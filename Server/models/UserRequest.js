import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';

const UserRequest = sequelize.define('UserRequest', {
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('flood', 'fire', 'earthquake', 'landslide', 'other'),
    allowNull: false,
  },
  affectedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  voice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

User.hasMany(UserRequest, { foreignKey: 'userId' });
UserRequest.belongsTo(User, { foreignKey: 'userId' });

export default UserRequest;
