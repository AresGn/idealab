<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-lightbulb"></i>
          <h1>IdéaLab</h1>
        </div>
        <p>Récupération de mot de passe</p>
      </div>

      <div v-if="!emailSent" class="forgot-form">
        <div class="form-intro">
          <div class="intro-icon">
            <i class="fas fa-key"></i>
          </div>
          <h2>Mot de passe oublié ?</h2>
          <p>
            Pas de problème ! Entrez votre adresse email et nous vous enverrons 
            un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form @submit.prevent="sendResetEmail" class="reset-form">
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              :class="{ 'error': errors.email }"
              placeholder="votre@email.com"
              required
            >
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-paper-plane"></i>
            {{ loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
          </button>

          <div v-if="errors.general" class="error-banner">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errors.general }}
          </div>
        </form>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Email envoyé !</h2>
        <p>
          Nous avons envoyé un lien de réinitialisation à <strong>{{ form.email }}</strong>
        </p>
        <div class="success-instructions">
          <h3>Étapes suivantes :</h3>
          <ol>
            <li>Vérifiez votre boîte de réception</li>
            <li>Cliquez sur le lien dans l'email</li>
            <li>Créez un nouveau mot de passe</li>
            <li>Connectez-vous avec votre nouveau mot de passe</li>
          </ol>
        </div>
        
        <div class="email-tips">
          <h4>Vous ne voyez pas l'email ?</h4>
          <ul>
            <li>Vérifiez votre dossier spam/courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>L'email peut prendre quelques minutes à arriver</li>
          </ul>
        </div>

        <div class="resend-section">
          <p>Vous n'avez pas reçu l'email ?</p>
          <button 
            @click="resendEmail" 
            class="btn btn-secondary"
            :disabled="resendCooldown > 0"
          >
            <i class="fas fa-redo"></i>
            {{ resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer l\'email' }}
          </button>
        </div>
      </div>

      <div class="auth-footer">
        <p>Vous vous souvenez de votre mot de passe ?</p>
        <router-link to="/login" class="link-secondary">
          <i class="fas fa-sign-in-alt"></i>
          Retour à la connexion
        </router-link>
      </div>
    </div>

    <div class="auth-background">
      <div class="floating-icons">
        <i class="fas fa-key"></i>
        <i class="fas fa-shield-alt"></i>
        <i class="fas fa-lock"></i>
        <i class="fas fa-envelope"></i>
        <i class="fas fa-user-shield"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
  data() {
    return {
      emailSent: false,
      loading: false,
      resendCooldown: 0,
      form: {
        email: ''
      },
      errors: {}
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.form.email) {
        this.errors.email = 'L\'adresse email est requise'
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = 'Format d\'email invalide'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async sendResetEmail() {
      if (!this.validateForm()) return
      
      this.loading = true
      this.errors = {}
      
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulation de succès
        this.emailSent = true
        this.startResendCooldown()
        
      } catch (error) {
        this.errors.general = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    },

    async resendEmail() {
      if (this.resendCooldown > 0) return
      
      try {
        // Simulation d'API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.startResendCooldown()
        
      } catch (error) {
        console.error('Erreur lors du renvoi:', error)
      }
    },

    startResendCooldown() {
      this.resendCooldown = 60
      const interval = setInterval(() => {
        this.resendCooldown--
        if (this.resendCooldown <= 0) {
          clearInterval(interval)
        }
      }, 1000)
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.forgot-password-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 2;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo i {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.auth-header p {
  color: #718096;
  font-size: 1.1rem;
}

.form-intro {
  text-align: center;
  margin-bottom: 2rem;
}

.intro-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
}

.form-intro h2 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-intro p {
  color: #4a5568;
  line-height: 1.6;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group input {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-banner {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.success-state {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #c6f6d5;
  color: #22543d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
}

.success-state h2 {
  color: #22543d;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-state > p {
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.success-instructions {
  background: #f0fff4;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.success-instructions h3 {
  color: #22543d;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-instructions ol {
  color: #2d3748;
  padding-left: 1.5rem;
}

.success-instructions li {
  margin-bottom: 0.5rem;
}

.email-tips {
  background: #fffaf0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.email-tips h4 {
  color: #c05621;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.email-tips ul {
  color: #4a5568;
  padding-left: 1.5rem;
}

.email-tips li {
  margin-bottom: 0.5rem;
}

.resend-section {
  margin-top: 2rem;
}

.resend-section p {
  color: #718096;
  margin-bottom: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #718096;
  margin-bottom: 1rem;
}

.link-secondary {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.link-secondary:hover {
  text-decoration: underline;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-icons i {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: 2rem;
  animation: float 6s ease-in-out infinite;
}

.floating-icons i:nth-child(1) {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.floating-icons i:nth-child(2) {
  top: 70%;
  left: 85%;
  animation-delay: 1s;
}

.floating-icons i:nth-child(3) {
  top: 25%;
  right: 15%;
  animation-delay: 2s;
}

.floating-icons i:nth-child(4) {
  bottom: 40%;
  left: 15%;
  animation-delay: 3s;
}

.floating-icons i:nth-child(5) {
  bottom: 15%;
  right: 10%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 768px) {
  .forgot-password-container {
    padding: 1rem;
  }
  
  .forgot-password-card {
    padding: 2rem;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
}
</style>
