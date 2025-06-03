import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import DisasterRequest from "./DisasterRequest.js";
import Disaster from "./Disaster.js";

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Volunteerid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  DisasterRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DisasterRequest,
      key: 'id',
    },
  },
  District: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
  },
  DisasterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Disaster,
      key: 'id',
    },
  },
  Task: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
// Associations
export default Assignment;