import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';


const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('Human', 'Material', 'Financial', 'Equipment', 'Facility', 'Infrastructure'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'resources',
  timestamps: true,
});


export default Resource;

// Human Resources

// Emergency medical staff (doctors, nurses, EMTs)

// Search and rescue teams

// Crisis communications teams

// Material Resources

// Bottled water

// Food rations (non-perishable food)

// First aid kits (bandages, medicines)

// Financial Resources

// Emergency relief funds for essential items (clothing, food, toiletries)

// Housing assistance payments or stipends for displaced employees

// Disaster pay and compensation provisions

// Equipment Resources

// Radios and satellite phones for communication

// Generators for emergency power supply

// Fire extinguishers

// Facility Resources

// Emergency shelters (temporary accommodation)

// Hospitals and medical facilities

// Emergency operations centers

// Infrastructure Resources

// Portable toilets and water purification units

// Temporary bridges and road repair materials

// Waste management equipment (dumpsters, removal services)
