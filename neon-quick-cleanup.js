import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

// Configuration de la base de données Neon
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

async function quickCleanup() {
  let client;
  
  try {
    console.log('🔗 Connexion à la base de données Neon...');
    client = new Client(dbConfig);
    await client.connect();
    
    // Exécution rapide sans confirmation
    console.log('🧹 Nettoyage rapide en cours...');
    
    // 1. Supprimer les 2 dernières idées
    const ideas = await client.query(`
      SELECT id FROM ideas ORDER BY created_at DESC LIMIT 2
    `);
    
    if (ideas.rows.length > 0) {
      const idsToDelete = ideas.rows.map(idea => idea.id);
      
      // Supprimer toutes les données liées
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [idsToDelete]);
      await client.query(`DELETE FROM comments WHERE idea_id = ANY($1)`, [idsToDelete]);
      
      // Supprimer les statistiques de partage (si la table existe)
      try {
        await client.query(`DELETE FROM sharing_stats WHERE idea_id = ANY($1)`, [idsToDelete]);
      } catch (error) {
        // Table n'existe pas, on ignore
      }
      
      await client.query(`DELETE FROM ideas WHERE id = ANY($1)`, [idsToDelete]);
      
      console.log(`✅ ${ideas.rows.length} dernières idées supprimées`);
    }
    
    // 2. Supprimer les idées avec commentaires
    const ideasWithComments = await client.query(`
      SELECT DISTINCT i.id FROM ideas i INNER JOIN comments c ON i.id = c.idea_id
    `);
    
    if (ideasWithComments.rows.length > 0) {
      const idsWithComments = ideasWithComments.rows.map(idea => idea.id);
      
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [idsWithComments]);
      await client.query(`DELETE FROM comments WHERE idea_id = ANY($1)`, [idsWithComments]);
      
      try {
        await client.query(`DELETE FROM sharing_stats WHERE idea_id = ANY($1)`, [idsWithComments]);
      } catch (error) {
        // Table n'existe pas, on ignore
      }
      
      await client.query(`DELETE FROM ideas WHERE id = ANY($1)`, [idsWithComments]);
      
      console.log(`✅ ${ideasWithComments.rows.length} idées avec commentaires supprimées`);
    }
    
    // 3. Remettre à zéro les compteurs des idées restantes
    const remainingIdeas = await client.query(`
      SELECT id FROM ideas ORDER BY created_at ASC LIMIT 3
    `);
    
    if (remainingIdeas.rows.length > 0) {
      const remainingIds = remainingIdeas.rows.map(idea => idea.id);
      
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [remainingIds]);
      await client.query(`
        UPDATE ideas 
        SET votes_count = 0, views_count = 0, comments_count = 0 
        WHERE id = ANY($1)
      `, [remainingIds]);
      
      console.log(`✅ Compteurs remis à zéro pour ${remainingIdeas.rows.length} idées`);
    }
    
    // Afficher le résultat final
    const finalCount = await client.query('SELECT COUNT(*) as count FROM ideas');
    console.log(`🎉 Nettoyage terminé! ${finalCount.rows[0].count} idées restantes`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Exécution
quickCleanup().catch(console.error);
