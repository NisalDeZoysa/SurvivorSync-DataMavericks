import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Disaster from './Disaster.js'; // Make sure this model is already created

const SafetyPrecaution = sequelize.define('Precaution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disasterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Disaster',
      key: 'id',
    },
  },
});

// Associations
SafetyPrecaution.belongsTo(Disaster, { foreignKey: 'disasterId' });

export default SafetyPrecaution;
