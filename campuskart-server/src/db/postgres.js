import { Sequelize } from 'sequelize';
import defineItemModel from '../models/item.model.js';

let sequelize;
let ItemModel;

export const connectPostgresDB = async () => {
  try {
    // Skip if POSTGRES_URI is not properly configured
    if (!process.env.POSTGRES_URI || process.env.POSTGRES_URI.includes('your_postgresql_connection_string_here')) {
      console.log('⚠️  PostgreSQL not configured - skipping connection');
      return null;
    }

    sequelize = new Sequelize(process.env.POSTGRES_URI, {
      dialect: 'postgres',
      logging: false, // Set to console.log to see SQL queries
    });

    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    // Initialize the Item model
    ItemModel = defineItemModel(sequelize);
    
    // Sync models with database (alter: true will update schema without dropping data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    console.log('⚠️  Continuing without PostgreSQL - Item features will not work');
    return null;
  }
};

export const getSequelize = () => {
  if (!sequelize) {
    throw new Error('Database not initialized. Call connectPostgresDB first.');
  }
  return sequelize;
};

export const getItemModel = () => {
  if (!ItemModel) {
    throw new Error('Item model not initialized. Call connectPostgresDB first.');
  }
  return ItemModel;
};
