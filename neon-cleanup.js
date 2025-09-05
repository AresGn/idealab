import pkg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

const { Client } = pkg;
dotenv.config();

// Configuration de la base de données Neon
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

async function cleanupNeonDatabase() {
  let client;
  
  try {
    console.log('🔗 Connexion à la base de données Neon...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connexion établie avec succès');

    // 1. Afficher l'état actuel
    console.log('\n📊 État actuel de la base de données:');
    
    const ideas = await client.query(`
      SELECT id, title, votes_count, views_count, comments_count, created_at 
      FROM ideas 
      ORDER BY created_at DESC
    `);
    
    console.log(`Total des idées: ${ideas.rows.length}`);
    ideas.rows.forEach((idea, index) => {
      const shortTitle = idea.title.length > 60 ? idea.title.substring(0, 60) + '...' : idea.title;
      console.log(`${index + 1}. ID: ${idea.id} | "${shortTitle}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count} | Commentaires: ${idea.comments_count}`);
    });

    // 2. Supprimer les 2 dernières idées (les plus récentes)
    console.log('\n🗑️ Suppression des 2 dernières idées...');
    
    if (ideas.rows.length >= 2) {
      const lastTwoIds = ideas.rows.slice(0, 2).map(idea => idea.id);
      console.log(`Suppression des idées avec IDs: ${lastTwoIds.join(', ')}`);
      
      // Supprimer d'abord les votes liés à ces idées
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [lastTwoIds]);
      
      // Supprimer les commentaires liés à ces idées
      await client.query(`DELETE FROM comments WHERE idea_id = ANY($1)`, [lastTwoIds]);
      
      // Supprimer les statistiques de partage liées à ces idées (si la table existe)
      try {
        await client.query(`DELETE FROM sharing_stats WHERE idea_id = ANY($1)`, [lastTwoIds]);
      } catch (error) {
        console.log('ℹ️ Table sharing_stats non trouvée, ignorée');
      }
      
      // Supprimer les idées elles-mêmes
      await client.query(`DELETE FROM ideas WHERE id = ANY($1)`, [lastTwoIds]);
      
      console.log('✅ 2 dernières idées supprimées avec succès');
    } else {
      console.log('⚠️ Moins de 2 idées dans la base, aucune suppression effectuée');
    }

    // 3. Supprimer les idées qui ont des commentaires
    console.log('\n🗑️ Suppression des idées avec commentaires...');
    
    const ideasWithComments = await client.query(`
      SELECT DISTINCT i.id, i.title, COUNT(c.id) as comment_count
      FROM ideas i
      INNER JOIN comments c ON i.id = c.idea_id
      GROUP BY i.id, i.title
    `);
    
    if (ideasWithComments.rows.length > 0) {
      console.log(`Idées avec commentaires trouvées: ${ideasWithComments.rows.length}`);
      ideasWithComments.rows.forEach(idea => {
        const shortTitle = idea.title.length > 50 ? idea.title.substring(0, 50) + '...' : idea.title;
        console.log(`- ID: ${idea.id} | "${shortTitle}" | ${idea.comment_count} commentaires`);
      });
      
      const idsWithComments = ideasWithComments.rows.map(idea => idea.id);
      
      // Supprimer les votes liés à ces idées
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [idsWithComments]);
      
      // Supprimer les commentaires
      await client.query(`DELETE FROM comments WHERE idea_id = ANY($1)`, [idsWithComments]);
      
      // Supprimer les statistiques de partage
      try {
        await client.query(`DELETE FROM sharing_stats WHERE idea_id = ANY($1)`, [idsWithComments]);
      } catch (error) {
        console.log('ℹ️ Table sharing_stats non trouvée, ignorée');
      }
      
      // Supprimer les idées
      await client.query(`DELETE FROM ideas WHERE id = ANY($1)`, [idsWithComments]);
      
      console.log('✅ Idées avec commentaires supprimées avec succès');
    } else {
      console.log('ℹ️ Aucune idée avec commentaires trouvée');
    }

    // 4. Remettre à 0 les compteurs des 3 idées restantes
    console.log('\n🔄 Remise à zéro des compteurs des idées restantes...');
    
    const remainingIdeas = await client.query(`
      SELECT id, title, votes_count, views_count, comments_count 
      FROM ideas 
      ORDER BY created_at ASC 
      LIMIT 3
    `);
    
    if (remainingIdeas.rows.length > 0) {
      console.log(`Idées restantes: ${remainingIdeas.rows.length}`);
      remainingIdeas.rows.forEach(idea => {
        const shortTitle = idea.title.length > 50 ? idea.title.substring(0, 50) + '...' : idea.title;
        console.log(`- ID: ${idea.id} | "${shortTitle}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count}`);
      });
      
      const remainingIds = remainingIdeas.rows.map(idea => idea.id);
      
      // Supprimer tous les votes pour ces idées
      await client.query(`DELETE FROM votes WHERE idea_id = ANY($1)`, [remainingIds]);
      
      // Remettre à zéro les compteurs
      await client.query(`
        UPDATE ideas 
        SET votes_count = 0, views_count = 0, comments_count = 0 
        WHERE id = ANY($1)
      `, [remainingIds]);
      
      console.log('✅ Compteurs remis à zéro pour les idées restantes');
    } else {
      console.log('⚠️ Aucune idée restante trouvée');
    }

    // 5. Afficher l'état final
    console.log('\n📊 État final de la base de données:');
    
    const finalIdeas = await client.query(`
      SELECT id, title, votes_count, views_count, comments_count, created_at 
      FROM ideas 
      ORDER BY created_at ASC
    `);
    
    console.log(`Total des idées restantes: ${finalIdeas.rows.length}`);
    finalIdeas.rows.forEach((idea, index) => {
      const shortTitle = idea.title.length > 60 ? idea.title.substring(0, 60) + '...' : idea.title;
      console.log(`${index + 1}. ID: ${idea.id} | "${shortTitle}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count} | Commentaires: ${idea.comments_count}`);
    });

    // 6. Statistiques de nettoyage
    console.log('\n📈 Statistiques de nettoyage:');
    
    const voteCount = await client.query('SELECT COUNT(*) as count FROM votes');
    const commentCount = await client.query('SELECT COUNT(*) as count FROM comments');
    
    console.log(`- Votes restants: ${voteCount.rows[0].count}`);
    console.log(`- Commentaires restants: ${commentCount.rows[0].count}`);

    console.log('\n🎉 Nettoyage de la base de données terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Fonction de confirmation
function askConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  ATTENTION: Cette opération va supprimer définitivement des données!');
    console.log('📋 Actions qui seront effectuées:');
    console.log('   1. Supprimer les 2 dernières idées');
    console.log('   2. Supprimer toutes les idées avec commentaires');
    console.log('   3. Remettre à 0 les compteurs (votes, vues) des 3 idées restantes');
    console.log('');
    
    rl.question('Êtes-vous sûr de vouloir continuer? (tapez "OUI" pour confirmer): ', (answer) => {
      rl.close();
      resolve(answer.toUpperCase() === 'OUI');
    });
  });
}

// Exécution du script
async function main() {
  console.log('🧹 Script de nettoyage de la base de données IdéaLab (Neon)');
  console.log('=======================================================\n');
  
  const confirmed = await askConfirmation();
  
  if (confirmed) {
    console.log('\n🚀 Démarrage du nettoyage...\n');
    await cleanupNeonDatabase();
  } else {
    console.log('\n❌ Opération annulée par l\'utilisateur');
    process.exit(0);
  }
}

// Lancer le script
main().catch(console.error);
