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

async function cleanupDatabase() {
  let client;

  try {
    console.log('🔗 Connexion à la base de données Neon...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connexion établie avec succès');

    // 1. Afficher l'état actuel de la base de données
    console.log('\n📊 État actuel de la base de données:');
    
    const ideas = await client.query(`
      SELECT id, title, votes_count, views_count, comments_count, created_at
      FROM ideas
      ORDER BY created_at DESC
    `);
    
    console.log(`Total des idées: ${ideas.rows.length}`);
    ideas.rows.forEach((idea, index) => {
      console.log(`${index + 1}. ID: ${idea.id} | "${idea.title}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count} | Commentaires: ${idea.comments_count} | Créée: ${idea.created_at}`);
    });

    // 2. Supprimer les 2 dernières idées (les plus récentes)
    console.log('\n🗑️ Suppression des 2 dernières idées...');
    
    if (ideas.length >= 2) {
      const lastTwoIds = ideas.slice(0, 2).map(idea => idea.id);
      console.log(`Suppression des idées avec IDs: ${lastTwoIds.join(', ')}`);
      
      // Supprimer d'abord les votes liés à ces idées
      await connection.execute(`
        DELETE FROM votes WHERE idea_id IN (${lastTwoIds.join(',')})
      `);
      
      // Supprimer les commentaires liés à ces idées
      await connection.execute(`
        DELETE FROM comments WHERE idea_id IN (${lastTwoIds.join(',')})
      `);
      
      // Supprimer les statistiques de partage liées à ces idées
      await connection.execute(`
        DELETE FROM sharing_stats WHERE idea_id IN (${lastTwoIds.join(',')})
      `);
      
      // Supprimer les idées elles-mêmes
      await connection.execute(`
        DELETE FROM ideas WHERE id IN (${lastTwoIds.join(',')})
      `);
      
      console.log('✅ 2 dernières idées supprimées avec succès');
    } else {
      console.log('⚠️ Moins de 2 idées dans la base, aucune suppression effectuée');
    }

    // 3. Supprimer les idées qui ont des commentaires
    console.log('\n🗑️ Suppression des idées avec commentaires...');
    
    const [ideasWithComments] = await connection.execute(`
      SELECT DISTINCT i.id, i.title, i.comments_count
      FROM ideas i
      INNER JOIN comments c ON i.id = c.idea_id
    `);
    
    if (ideasWithComments.length > 0) {
      console.log(`Idées avec commentaires trouvées: ${ideasWithComments.length}`);
      ideasWithComments.forEach(idea => {
        console.log(`- ID: ${idea.id} | "${idea.title}" | ${idea.comments_count} commentaires`);
      });
      
      const idsWithComments = ideasWithComments.map(idea => idea.id);
      
      // Supprimer les votes liés à ces idées
      await connection.execute(`
        DELETE FROM votes WHERE idea_id IN (${idsWithComments.join(',')})
      `);
      
      // Supprimer les commentaires
      await connection.execute(`
        DELETE FROM comments WHERE idea_id IN (${idsWithComments.join(',')})
      `);
      
      // Supprimer les statistiques de partage
      await connection.execute(`
        DELETE FROM sharing_stats WHERE idea_id IN (${idsWithComments.join(',')})
      `);
      
      // Supprimer les idées
      await connection.execute(`
        DELETE FROM ideas WHERE id IN (${idsWithComments.join(',')})
      `);
      
      console.log('✅ Idées avec commentaires supprimées avec succès');
    } else {
      console.log('ℹ️ Aucune idée avec commentaires trouvée');
    }

    // 4. Remettre à 0 les compteurs des 3 idées restantes
    console.log('\n🔄 Remise à zéro des compteurs des idées restantes...');
    
    const [remainingIdeas] = await connection.execute(`
      SELECT id, title, votes_count, views_count, comments_count 
      FROM ideas 
      ORDER BY created_at ASC 
      LIMIT 3
    `);
    
    if (remainingIdeas.length > 0) {
      console.log(`Idées restantes: ${remainingIdeas.length}`);
      remainingIdeas.forEach(idea => {
        console.log(`- ID: ${idea.id} | "${idea.title}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count}`);
      });
      
      const remainingIds = remainingIdeas.map(idea => idea.id);
      
      // Supprimer tous les votes pour ces idées
      await connection.execute(`
        DELETE FROM votes WHERE idea_id IN (${remainingIds.join(',')})
      `);
      
      // Remettre à zéro les compteurs
      await connection.execute(`
        UPDATE ideas 
        SET votes_count = 0, views_count = 0, comments_count = 0 
        WHERE id IN (${remainingIds.join(',')})
      `);
      
      console.log('✅ Compteurs remis à zéro pour les idées restantes');
    } else {
      console.log('⚠️ Aucune idée restante trouvée');
    }

    // 5. Afficher l'état final
    console.log('\n📊 État final de la base de données:');
    
    const [finalIdeas] = await connection.execute(`
      SELECT id, title, votes_count, views_count, comments_count, created_at 
      FROM ideas 
      ORDER BY created_at ASC
    `);
    
    console.log(`Total des idées restantes: ${finalIdeas.length}`);
    finalIdeas.forEach((idea, index) => {
      console.log(`${index + 1}. ID: ${idea.id} | "${idea.title}" | Votes: ${idea.votes_count} | Vues: ${idea.views_count} | Commentaires: ${idea.comments_count} | Créée: ${idea.created_at}`);
    });

    // 6. Statistiques de nettoyage
    console.log('\n📈 Statistiques de nettoyage:');
    
    const [voteCount] = await connection.execute('SELECT COUNT(*) as count FROM votes');
    const [commentCount] = await connection.execute('SELECT COUNT(*) as count FROM comments');
    const [sharingCount] = await connection.execute('SELECT COUNT(*) as count FROM sharing_stats');
    
    console.log(`- Votes restants: ${voteCount[0].count}`);
    console.log(`- Commentaires restants: ${commentCount[0].count}`);
    console.log(`- Statistiques de partage restantes: ${sharingCount[0].count}`);

    console.log('\n🎉 Nettoyage de la base de données terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
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
  console.log('🧹 Script de nettoyage de la base de données IdéaLab');
  console.log('================================================\n');
  
  const confirmed = await askConfirmation();
  
  if (confirmed) {
    console.log('\n🚀 Démarrage du nettoyage...\n');
    await cleanupDatabase();
  } else {
    console.log('\n❌ Opération annulée par l\'utilisateur');
    process.exit(0);
  }
}

// Lancer le script si exécuté directement
main().catch(console.error);

export { cleanupDatabase };
