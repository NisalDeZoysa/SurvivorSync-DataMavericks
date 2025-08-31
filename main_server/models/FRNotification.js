import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';

const FRNotification = sequelize.define('FRNotification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    disasterRequestId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'disaster_requests', 
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_assigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    
}, {
  tableName: 'fr_notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});



export default FRNotification;




