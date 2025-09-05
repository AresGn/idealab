import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'idealab',
  charset: 'utf8mb4'
};

async function quickCleanup() {
  let connection;
  
  try {
    console.log('🔗 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // Exécution rapide sans confirmation
    console.log('🧹 Nettoyage rapide en cours...');
    
    // 1. Supprimer les 2 dernières idées
    const [ideas] = await connection.execute(`
      SELECT id FROM ideas ORDER BY created_at DESC LIMIT 2
    `);
    
    if (ideas.length > 0) {
      const idsToDelete = ideas.map(idea => idea.id);
      
      // Supprimer toutes les données liées
      await connection.execute(`DELETE FROM votes WHERE idea_id IN (${idsToDelete.join(',')})`);
      await connection.execute(`DELETE FROM comments WHERE idea_id IN (${idsToDelete.join(',')})`);
      await connection.execute(`DELETE FROM sharing_stats WHERE idea_id IN (${idsToDelete.join(',')})`);
      await connection.execute(`DELETE FROM ideas WHERE id IN (${idsToDelete.join(',')})`);
      
      console.log(`✅ ${ideas.length} dernières idées supprimées`);
    }
    
    // 2. Supprimer les idées avec commentaires
    const [ideasWithComments] = await connection.execute(`
      SELECT DISTINCT i.id FROM ideas i INNER JOIN comments c ON i.id = c.idea_id
    `);
    
    if (ideasWithComments.length > 0) {
      const idsWithComments = ideasWithComments.map(idea => idea.id);
      
      await connection.execute(`DELETE FROM votes WHERE idea_id IN (${idsWithComments.join(',')})`);
      await connection.execute(`DELETE FROM comments WHERE idea_id IN (${idsWithComments.join(',')})`);
      await connection.execute(`DELETE FROM sharing_stats WHERE idea_id IN (${idsWithComments.join(',')})`);
      await connection.execute(`DELETE FROM ideas WHERE id IN (${idsWithComments.join(',')})`);
      
      console.log(`✅ ${ideasWithComments.length} idées avec commentaires supprimées`);
    }
    
    // 3. Remettre à zéro les compteurs des idées restantes
    const [remainingIdeas] = await connection.execute(`
      SELECT id FROM ideas ORDER BY created_at ASC LIMIT 3
    `);
    
    if (remainingIdeas.length > 0) {
      const remainingIds = remainingIdeas.map(idea => idea.id);
      
      await connection.execute(`DELETE FROM votes WHERE idea_id IN (${remainingIds.join(',')})`);
      await connection.execute(`
        UPDATE ideas 
        SET votes_count = 0, views_count = 0, comments_count = 0 
        WHERE id IN (${remainingIds.join(',')})
      `);
      
      console.log(`✅ Compteurs remis à zéro pour ${remainingIdeas.length} idées`);
    }
    
    // Afficher le résultat final
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM ideas');
    console.log(`🎉 Nettoyage terminé! ${finalCount[0].count} idées restantes`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécution
quickCleanup().catch(console.error);
