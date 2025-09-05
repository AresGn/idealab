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

async function checkDatabaseStatus() {
  let client;

  try {
    console.log('🔗 Connexion à la base de données Neon...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connexion établie avec Neon\n');

    // 1. Statistiques générales
    console.log('📊 STATISTIQUES GÉNÉRALES');
    console.log('========================');
    
    const ideaCount = await client.query('SELECT COUNT(*) as count FROM ideas');
    const voteCount = await client.query('SELECT COUNT(*) as count FROM votes');
    const commentCount = await client.query('SELECT COUNT(*) as count FROM comments');
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`📝 Total des idées: ${ideaCount.rows[0].count}`);
    console.log(`👍 Total des votes: ${voteCount.rows[0].count}`);
    console.log(`💬 Total des commentaires: ${commentCount.rows[0].count}`);
    console.log(`👥 Total des utilisateurs: ${userCount.rows[0].count}`);

    // 2. Détail des idées
    console.log('\n📋 DÉTAIL DES IDÉES');
    console.log('==================');
    
    const ideas = await client.query(`
      SELECT
        id,
        title,
        votes_count,
        views_count,
        comments_count,
        created_at,
        CASE
          WHEN LENGTH(title) > 50 THEN CONCAT(SUBSTRING(title, 1, 50), '...')
          ELSE title
        END as short_title
      FROM ideas
      ORDER BY created_at DESC
    `);
    
    if (ideas.rows.length === 0) {
      console.log('❌ Aucune idée trouvée dans la base de données');
    } else {
      ideas.rows.forEach((idea, index) => {
        const date = new Date(idea.created_at).toLocaleDateString('fr-FR');
        console.log(`${index + 1}. [ID: ${idea.id}] "${idea.short_title}"`);
        console.log(`   📊 Votes: ${idea.votes_count} | 👁️ Vues: ${idea.views_count} | 💬 Commentaires: ${idea.comments_count}`);
        console.log(`   📅 Créée le: ${date}\n`);
      });
    }

    // 3. Idées avec commentaires
    console.log('💬 IDÉES AVEC COMMENTAIRES');
    console.log('=========================');
    
    const ideasWithComments = await client.query(`
      SELECT
        i.id,
        i.title,
        COUNT(c.id) as comment_count,
        CASE
          WHEN LENGTH(i.title) > 40 THEN CONCAT(SUBSTRING(i.title, 1, 40), '...')
          ELSE i.title
        END as short_title
      FROM ideas i
      INNER JOIN comments c ON i.id = c.idea_id
      GROUP BY i.id, i.title
      ORDER BY comment_count DESC
    `);
    
    if (ideasWithComments.rows.length === 0) {
      console.log('✅ Aucune idée avec commentaires');
    } else {
      ideasWithComments.rows.forEach((idea, index) => {
        console.log(`${index + 1}. [ID: ${idea.id}] "${idea.short_title}" - ${idea.comment_count} commentaire(s)`);
      });
    }

    // 4. Statistiques de votes
    console.log('\n👍 STATISTIQUES DE VOTES');
    console.log('========================');
    
    const [voteStats] = await connection.execute(`
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM votes 
      GROUP BY vote_type
    `);
    
    if (voteStats.length === 0) {
      console.log('✅ Aucun vote dans la base de données');
    } else {
      voteStats.forEach(stat => {
        const emoji = stat.vote_type === 'like' ? '👍' : '👎';
        console.log(`${emoji} ${stat.vote_type}: ${stat.count}`);
      });
    }

    // 5. Activité récente
    console.log('\n🕒 ACTIVITÉ RÉCENTE');
    console.log('==================');
    
    const [recentVotes] = await connection.execute(`
      SELECT 
        v.vote_type,
        i.title,
        v.created_at,
        CASE 
          WHEN LENGTH(i.title) > 30 THEN CONCAT(SUBSTRING(i.title, 1, 30), '...')
          ELSE i.title
        END as short_title
      FROM votes v
      JOIN ideas i ON v.idea_id = i.id
      ORDER BY v.created_at DESC
      LIMIT 5
    `);
    
    if (recentVotes.length === 0) {
      console.log('❌ Aucune activité récente');
    } else {
      console.log('Derniers votes:');
      recentVotes.forEach((vote, index) => {
        const emoji = vote.vote_type === 'like' ? '👍' : '👎';
        const date = new Date(vote.created_at).toLocaleString('fr-FR');
        console.log(`${index + 1}. ${emoji} "${vote.short_title}" - ${date}`);
      });
    }

    // 6. Recommandations de nettoyage
    console.log('\n🧹 RECOMMANDATIONS DE NETTOYAGE');
    console.log('===============================');
    
    const totalIdeas = ideaCount[0].count;
    const ideasWithCommentsCount = ideasWithComments.length;
    
    if (totalIdeas === 0) {
      console.log('✅ Base de données déjà vide');
    } else if (totalIdeas <= 3) {
      console.log('⚠️ Peu d\'idées dans la base. Nettoyage non recommandé.');
    } else {
      console.log(`📋 Actions recommandées:`);
      console.log(`   • Supprimer les 2 dernières idées (les plus récentes)`);
      if (ideasWithCommentsCount > 0) {
        console.log(`   • Supprimer ${ideasWithCommentsCount} idée(s) avec commentaires`);
      }
      console.log(`   • Remettre à zéro les compteurs des idées restantes`);
      console.log(`   • Idées qui resteront: ${Math.max(0, totalIdeas - 2 - ideasWithCommentsCount)}`);
    }

    console.log('\n🎯 Pour nettoyer la base de données, exécutez:');
    console.log('   node cleanup-database.js    (avec confirmation)');
    console.log('   node quick-cleanup.js       (sans confirmation)');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Exécution
checkDatabaseStatus().catch(console.error);
