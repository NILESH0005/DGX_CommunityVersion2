import { sequelize } from './models/index.js';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All models synced to MySQL');
    process.exit();
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    process.exit(1);
  }
})();
