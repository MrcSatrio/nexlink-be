const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const Users = require('./usersModel');
const Projects = require('./projectsModel');

const Tasks = sequelize.define('Task', {
  id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  ProjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Projects, // Use the Projects model directly
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.UUID, // Update data type to UUID for consistency
    allowNull: true,
    references: {
      model: Users, // Use the Users model directly
      key: 'id'
    }
  },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE }
});

module.exports = Tasks;
