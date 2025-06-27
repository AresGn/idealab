<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-lightbulb"></i>
          <h1>IdéaLab</h1>
        </div>
        <p>Rejoignez la communauté d'innovateurs</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">
              <i class="fas fa-user"></i>
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              v-model="form.firstName"
              :class="{ 'error': errors.firstName }"
              placeholder="Votre prénom"
              required
            >
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-group">
            <label for="lastName">
              <i class="fas fa-user"></i>
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              v-model="form.lastName"
              :class="{ 'error': errors.lastName }"
              placeholder="Votre nom"
              required
            >
            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="username">
            <i class="fas fa-at"></i>
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            :class="{ 'error': errors.username }"
            placeholder="Choisissez un nom d'utilisateur"
            required
          >
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

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

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Mot de passe
          </label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              :class="{ 'error': errors.password }"
              placeholder="Créez un mot de passe sécurisé"
              required
            >
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar" :class="passwordStrength.class">
              <div class="strength-fill" :style="{ width: passwordStrength.width }"></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">
            <i class="fas fa-lock"></i>
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="Confirmez votre mot de passe"
            required
          >
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.acceptTerms" required>
            <span class="checkmark"></span>
            J'accepte les 
            <router-link to="/terms" class="inline-link">conditions d'utilisation</router-link>
            et la 
            <router-link to="/privacy" class="inline-link">politique de confidentialité</router-link>
          </label>
          <span v-if="errors.acceptTerms" class="error-message">{{ errors.acceptTerms }}</span>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.newsletter">
            <span class="checkmark"></span>
            Recevoir les actualités et conseils d'IdéaLab par email
          </label>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-user-plus"></i>
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>

        <div v-if="errors.general" class="error-banner">
          <i class="fas fa-exclamation-triangle"></i>
          {{ errors.general }}
        </div>
      </form>

      <div class="auth-footer">
        <p>Déjà un compte ?</p>
        <router-link to="/login" class="link-secondary">
          <i class="fas fa-sign-in-alt"></i>
          Se connecter
        </router-link>
      </div>
    </div>

    <div class="auth-background">
      <div class="floating-icons">
        <i class="fas fa-lightbulb"></i>
        <i class="fas fa-rocket"></i>
        <i class="fas fa-brain"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-cog"></i>
        <i class="fas fa-users"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        newsletter: false
      },
      showPassword: false,
      loading: false,
      errors: {}
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    
    passwordStrength() {
      const password = this.form.password
      if (!password) return { class: '', width: '0%', text: '' }
      
      let score = 0
      let feedback = []
      
      // Longueur
      if (password.length >= 8) score += 1
      else feedback.push('8 caractères min')
      
      // Majuscules
      if (/[A-Z]/.test(password)) score += 1
      else feedback.push('majuscule')
      
      // Minuscules
      if (/[a-z]/.test(password)) score += 1
      else feedback.push('minuscule')
      
      // Chiffres
      if (/\d/.test(password)) score += 1
      else feedback.push('chiffre')
      
      // Caractères spéciaux
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      else feedback.push('caractère spécial')
      
      const strength = {
        0: { class: 'weak', width: '20%', text: 'Très faible' },
        1: { class: 'weak', width: '20%', text: 'Faible' },
        2: { class: 'medium', width: '40%', text: 'Moyen' },
        3: { class: 'medium', width: '60%', text: 'Bon' },
        4: { class: 'strong', width: '80%', text: 'Fort' },
        5: { class: 'strong', width: '100%', text: 'Très fort' }
      }
      
      return strength[score] || strength[0]
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.form.firstName.trim()) {
        this.errors.firstName = 'Le prénom est requis'
      }
      
      if (!this.form.lastName.trim()) {
        this.errors.lastName = 'Le nom est requis'
      }
      
      if (!this.form.username.trim()) {
        this.errors.username = 'Le nom d\'utilisateur est requis'
      } else if (this.form.username.length < 3) {
        this.errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      } else if (!/^[a-zA-Z0-9_]+$/.test(this.form.username)) {
        this.errors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et _'
      }
      
      if (!this.form.email) {
        this.errors.email = 'L\'adresse email est requise'
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = 'Format d\'email invalide'
      }
      
      if (!this.form.password) {
        this.errors.password = 'Le mot de passe est requis'
      } else if (this.form.password.length < 8) {
        this.errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
      }
      
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'La confirmation du mot de passe est requise'
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      if (!this.form.acceptTerms) {
        this.errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async handleRegister() {
      if (!this.validateForm()) return
      
      this.loading = true
      this.errors = {}
      
      try {
        const result = await this.authStore.register({
          firstName: this.form.firstName.trim(),
          lastName: this.form.lastName.trim(),
          username: this.form.username.trim(),
          email: this.form.email.trim(),
          password: this.form.password,
          newsletter: this.form.newsletter
        })
        
        if (result.success) {
          this.$router.push('/dashboard')
        } else {
          this.errors.general = result.error || 'Erreur lors de la création du compte'
        }
      } catch (error) {
        this.errors.general = 'Une erreur est survenue. Veuillez réessayer.'
        console.error('Erreur d\'inscription:', error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    // Rediriger si déjà connecté
    if (this.authStore.isLoggedIn) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
/* Réutilise les styles de Login.vue avec quelques ajouts */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 2;
  max-height: 90vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak .strength-fill {
  background: #e53e3e;
}

.strength-bar.medium .strength-fill {
  background: #f6ad55;
}

.strength-bar.strong .strength-fill {
  background: #38a169;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #718096;
  min-width: 60px;
}

.inline-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.inline-link:hover {
  text-decoration: underline;
}

/* Réutilise tous les autres styles de Login.vue */
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

.auth-form {
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

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
}

.password-toggle:hover {
  color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.floating-icons i:nth-child(6) {
  top: 50%;
  left: 5%;
  animation-delay: 5s;
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
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .password-strength {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
