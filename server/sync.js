import db from './models/index.js';

(async () => {
  try {
    await db.sequelize.sync({ alter: true });
    console.log('✅ All models synced to MySQL');
    process.exit();
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    process.exit(1);
  }
})();
