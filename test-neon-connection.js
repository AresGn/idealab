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

async function testConnection() {
  let client;
  
  try {
    console.log('🔗 Test de connexion à Neon...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connexion réussie!\n');

    // Test simple - compter les idées
    console.log('📊 STATISTIQUES RAPIDES');
    console.log('=======================');
    
    const ideaCount = await client.query('SELECT COUNT(*) as count FROM ideas');
    const voteCount = await client.query('SELECT COUNT(*) as count FROM votes');
    const commentCount = await client.query('SELECT COUNT(*) as count FROM comments');
    
    console.log(`📝 Total des idées: ${ideaCount.rows[0].count}`);
    console.log(`👍 Total des votes: ${voteCount.rows[0].count}`);
    console.log(`💬 Total des commentaires: ${commentCount.rows[0].count}`);

    // Lister les idées
    console.log('\n📋 LISTE DES IDÉES');
    console.log('==================');
    
    const ideas = await client.query(`
      SELECT 
        id, 
        title, 
        votes_count, 
        views_count, 
        comments_count, 
        created_at
      FROM ideas 
      ORDER BY created_at DESC
    `);
    
    if (ideas.rows.length === 0) {
      console.log('❌ Aucune idée trouvée');
    } else {
      ideas.rows.forEach((idea, index) => {
        const date = new Date(idea.created_at).toLocaleDateString('fr-FR');
        const shortTitle = idea.title.length > 50 ? idea.title.substring(0, 50) + '...' : idea.title;
        console.log(`${index + 1}. [ID: ${idea.id}] "${shortTitle}"`);
        console.log(`   📊 Votes: ${idea.votes_count} | 👁️ Vues: ${idea.views_count} | 💬 Commentaires: ${idea.comments_count}`);
        console.log(`   📅 Créée le: ${date}\n`);
      });
    }

    // Idées avec commentaires
    console.log('💬 IDÉES AVEC COMMENTAIRES');
    console.log('=========================');
    
    const ideasWithComments = await client.query(`
      SELECT 
        i.id, 
        i.title, 
        COUNT(c.id) as comment_count
      FROM ideas i
      INNER JOIN comments c ON i.id = c.idea_id
      GROUP BY i.id, i.title
      ORDER BY comment_count DESC
    `);
    
    if (ideasWithComments.rows.length === 0) {
      console.log('✅ Aucune idée avec commentaires');
    } else {
      ideasWithComments.rows.forEach((idea, index) => {
        const shortTitle = idea.title.length > 40 ? idea.title.substring(0, 40) + '...' : idea.title;
        console.log(`${index + 1}. [ID: ${idea.id}] "${shortTitle}" - ${idea.comment_count} commentaire(s)`);
      });
    }

    console.log('\n🎯 ACTIONS RECOMMANDÉES POUR LE NETTOYAGE:');
    console.log('==========================================');
    
    const totalIdeas = parseInt(ideaCount.rows[0].count);
    const ideasWithCommentsCount = ideasWithComments.rows.length;
    
    if (totalIdeas === 0) {
      console.log('✅ Base de données déjà vide');
    } else if (totalIdeas <= 3) {
      console.log('⚠️ Peu d\'idées dans la base. Nettoyage non recommandé.');
    } else {
      console.log(`📋 Le script de nettoyage va:`);
      console.log(`   • Supprimer les 2 dernières idées (les plus récentes)`);
      if (ideasWithCommentsCount > 0) {
        console.log(`   • Supprimer ${ideasWithCommentsCount} idée(s) avec commentaires`);
      }
      console.log(`   • Remettre à zéro les compteurs des idées restantes`);
      console.log(`   • Idées qui resteront: ${Math.max(0, totalIdeas - 2 - ideasWithCommentsCount)}`);
    }

    console.log('\n🧹 Pour nettoyer la base de données:');
    console.log('   node cleanup-database.js    (avec confirmation)');
    console.log('   node quick-cleanup.js       (sans confirmation)');

  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

testConnection().catch(console.error);
