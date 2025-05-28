import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';

const FirstResponder = sequelize.define('FirstResponder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    NIC: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    type: {
      type: DataTypes.ENUM('Police', 'Army', 'Hospital', 'Redcross', 'NGO', 'Government', 'Other'),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceCenterId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resource_centers', 
        key: 'id',
      },
    }
}, {
  tableName: 'first_responders',
});



export default FirstResponder;




