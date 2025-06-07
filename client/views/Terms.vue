<template>
  <div class="terms-container">
    <div class="terms-header">
      <h1>
        <i class="fas fa-file-contract"></i>
        Conditions d'utilisation
      </h1>
      <p>Dernière mise à jour : {{ lastUpdated }}</p>
    </div>

    <div class="terms-content">
      <section class="terms-section">
        <h2>1. Acceptation des conditions</h2>
        <p>
          En accédant et en utilisant IdéaLab, vous acceptez d'être lié par ces conditions d'utilisation. 
          Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
        </p>
      </section>

      <section class="terms-section">
        <h2>2. Description du service</h2>
        <p>
          IdéaLab est une plateforme collaborative qui permet aux utilisateurs de partager, 
          développer et voter pour des idées innovantes adaptées au contexte africain.
        </p>
      </section>

      <section class="terms-section">
        <h2>3. Compte utilisateur</h2>
        <ul>
          <li>Vous devez fournir des informations exactes lors de l'inscription</li>
          <li>Vous êtes responsable de la sécurité de votre compte</li>
          <li>Un seul compte par personne est autorisé</li>
          <li>Vous devez avoir au moins 16 ans pour créer un compte</li>
        </ul>
      </section>

      <section class="terms-section">
        <h2>4. Contenu utilisateur</h2>
        <p>
          En publiant du contenu sur IdéaLab, vous accordez à la plateforme une licence 
          non exclusive pour utiliser, modifier et distribuer ce contenu dans le cadre du service.
        </p>
        <p>Vous vous engagez à ne pas publier de contenu :</p>
        <ul>
          <li>Illégal, offensant ou diffamatoire</li>
          <li>Violant les droits de propriété intellectuelle</li>
          <li>Contenant des virus ou codes malveillants</li>
          <li>Faisant la promotion de la violence ou de la haine</li>
        </ul>
      </section>

      <section class="terms-section">
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Les idées partagées sur IdéaLab restent la propriété de leurs auteurs. 
          Cependant, en les publiant, vous acceptez qu'elles soient visibles et 
          commentées par la communauté.
        </p>
      </section>

      <section class="terms-section">
        <h2>6. Limitation de responsabilité</h2>
        <p>
          IdéaLab ne peut être tenu responsable des dommages directs ou indirects 
          résultant de l'utilisation de la plateforme ou du contenu publié par les utilisateurs.
        </p>
      </section>

      <section class="terms-section">
        <h2>7. Modification des conditions</h2>
        <p>
          Nous nous réservons le droit de modifier ces conditions à tout moment. 
          Les utilisateurs seront notifiés des changements importants.
        </p>
      </section>

      <section class="terms-section">
        <h2>8. Contact</h2>
        <p>
          Pour toute question concernant ces conditions, contactez-nous à : 
          <a href="mailto:legal@idealab.com">legal@idealab.com</a>
        </p>
      </section>
    </div>

    <div class="terms-actions">
      <router-link to="/register" class="btn btn-primary">
        <i class="fas fa-check"></i>
        J'accepte et je m'inscris
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
  name: 'Terms',
  data() {
    return {
      lastUpdated: '15 janvier 2024'
    }
  }
}
</script>

<style scoped>
.terms-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.terms-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.terms-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.terms-header p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.terms-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.terms-section {
  margin-bottom: 2.5rem;
}

.terms-section:last-child {
  margin-bottom: 0;
}

.terms-section h2 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.terms-section p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.terms-section ul {
  color: #4a5568;
  line-height: 1.6;
  padding-left: 1.5rem;
}

.terms-section li {
  margin-bottom: 0.5rem;
}

.terms-section a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.terms-section a:hover {
  text-decoration: underline;
}

.terms-actions {
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
  .terms-container {
    padding: 1rem;
  }
  
  .terms-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .terms-content {
    padding: 2rem;
  }
  
  .terms-actions {
    flex-direction: column;
  }
}
</style>
