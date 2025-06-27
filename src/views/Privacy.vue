<template>
  <div class="privacy-container">
    <div class="privacy-header">
      <h1>
        <i class="fas fa-shield-alt"></i>
        Politique de confidentialité
      </h1>
      <p>Dernière mise à jour : {{ lastUpdated }}</p>
    </div>

    <div class="privacy-content">
      <section class="privacy-section">
        <h2>1. Collecte des données</h2>
        <p>
          IdéaLab collecte les informations suivantes :
        </p>
        <ul>
          <li><strong>Informations de compte :</strong> nom, prénom, email, nom d'utilisateur</li>
          <li><strong>Contenu :</strong> idées, commentaires, votes que vous publiez</li>
          <li><strong>Données d'usage :</strong> pages visitées, temps passé, interactions</li>
          <li><strong>Données techniques :</strong> adresse IP, navigateur, appareil</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>2. Utilisation des données</h2>
        <p>Nous utilisons vos données pour :</p>
        <ul>
          <li>Fournir et améliorer nos services</li>
          <li>Personnaliser votre expérience</li>
          <li>Communiquer avec vous</li>
          <li>Assurer la sécurité de la plateforme</li>
          <li>Analyser l'utilisation pour améliorer IdéaLab</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>3. Partage des données</h2>
        <p>
          Nous ne vendons jamais vos données personnelles. Nous pouvons partager 
          des informations dans les cas suivants :
        </p>
        <ul>
          <li>Avec votre consentement explicite</li>
          <li>Pour se conformer à la loi</li>
          <li>Pour protéger nos droits et ceux des utilisateurs</li>
          <li>Avec des prestataires de services (hébergement, analytics)</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>4. Sécurité des données</h2>
        <p>
          Nous mettons en place des mesures de sécurité appropriées :
        </p>
        <ul>
          <li>Chiffrement des mots de passe avec bcrypt</li>
          <li>Connexions sécurisées HTTPS</li>
          <li>Accès limité aux données personnelles</li>
          <li>Surveillance continue des accès</li>
          <li>Sauvegardes sécurisées régulières</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>5. Vos droits</h2>
        <p>Vous avez le droit de :</p>
        <ul>
          <li><strong>Accès :</strong> consulter vos données personnelles</li>
          <li><strong>Rectification :</strong> corriger des informations inexactes</li>
          <li><strong>Suppression :</strong> demander la suppression de vos données</li>
          <li><strong>Portabilité :</strong> récupérer vos données dans un format standard</li>
          <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>6. Cookies et technologies similaires</h2>
        <p>
          Nous utilisons des cookies pour améliorer votre expérience :
        </p>
        <ul>
          <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement</li>
          <li><strong>Cookies de préférences :</strong> mémoriser vos choix</li>
          <li><strong>Cookies d'analyse :</strong> comprendre l'utilisation (avec votre consentement)</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>7. Conservation des données</h2>
        <p>
          Nous conservons vos données :
        </p>
        <ul>
          <li>Tant que votre compte est actif</li>
          <li>3 ans après la suppression du compte (pour les obligations légales)</li>
          <li>Les idées publiées peuvent être conservées de manière anonymisée</li>
        </ul>
      </section>

      <section class="privacy-section">
        <h2>8. Transferts internationaux</h2>
        <p>
          Vos données sont principalement stockées en Afrique. En cas de transfert 
          vers d'autres pays, nous nous assurons d'un niveau de protection adéquat.
        </p>
      </section>

      <section class="privacy-section">
        <h2>9. Modifications de cette politique</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité. Les changements 
          importants vous seront notifiés par email ou via la plateforme.
        </p>
      </section>

      <section class="privacy-section">
        <h2>10. Contact</h2>
        <p>
          Pour toute question sur cette politique ou pour exercer vos droits :
        </p>
        <ul>
          <li>Email : <a href="mailto:privacy@idealab.com">privacy@idealab.com</a></li>
          <li>Délégué à la protection des données : <a href="mailto:dpo@idealab.com">dpo@idealab.com</a></li>
        </ul>
      </section>
    </div>

    <div class="privacy-actions">
      <router-link to="/settings" class="btn btn-primary">
        <i class="fas fa-cog"></i>
        Gérer mes préférences
      </router-link>
      <router-link to="/" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i>
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Privacy',
  data() {
    return {
      lastUpdated: '15 janvier 2024'
    }
  }
}
</script>

<style scoped>
.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.privacy-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.privacy-header p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.privacy-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.privacy-section {
  margin-bottom: 2.5rem;
}

.privacy-section:last-child {
  margin-bottom: 0;
}

.privacy-section h2 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.privacy-section p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.privacy-section ul {
  color: #4a5568;
  line-height: 1.6;
  padding-left: 1.5rem;
}

.privacy-section li {
  margin-bottom: 0.5rem;
}

.privacy-section strong {
  color: #2d3748;
  font-weight: 600;
}

.privacy-section a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.privacy-section a:hover {
  text-decoration: underline;
}

.privacy-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .privacy-container {
    padding: 1rem;
  }
  
  .privacy-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .privacy-content {
    padding: 2rem;
  }
  
  .privacy-actions {
    flex-direction: column;
  }
}
</style>
