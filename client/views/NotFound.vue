<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-animation">
        <div class="error-number">4</div>
        <div class="error-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="error-number">4</div>
      </div>
      
      <h1>Page introuvable</h1>
      <p class="error-message">
        Oups ! La page que vous cherchez semble avoir disparu dans l'univers des idées.
      </p>
      
      <div class="suggestions">
        <h3>Que souhaitez-vous faire ?</h3>
        <div class="suggestion-cards">
          <router-link to="/" class="suggestion-card">
            <div class="card-icon">
              <i class="fas fa-home"></i>
            </div>
            <h4>Retour à l'accueil</h4>
            <p>Découvrez les dernières idées innovantes</p>
          </router-link>
          
          <router-link to="/dashboard" class="suggestion-card" v-if="isLoggedIn">
            <div class="card-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h4>Mon tableau de bord</h4>
            <p>Gérez vos idées et suivez vos performances</p>
          </router-link>
          
          <router-link to="/submit" class="suggestion-card" v-if="isLoggedIn">
            <div class="card-icon">
              <i class="fas fa-plus"></i>
            </div>
            <h4>Soumettre une idée</h4>
            <p>Partagez votre prochaine innovation</p>
          </router-link>
          
          <router-link to="/login" class="suggestion-card" v-if="!isLoggedIn">
            <div class="card-icon">
              <i class="fas fa-sign-in-alt"></i>
            </div>
            <h4>Se connecter</h4>
            <p>Accédez à votre espace personnel</p>
          </router-link>
        </div>
      </div>
      
      <div class="help-section">
        <h3>Besoin d'aide ?</h3>
        <p>
          Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter à 
          <a href="mailto:support@idealab.com">support@idealab.com</a>
        </p>
        
        <div class="search-section">
          <h4>Ou recherchez ce que vous cherchez :</h4>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Rechercher une idée, un secteur..."
              @keyup.enter="performSearch"
            >
            <button @click="performSearch" class="search-btn">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="back-button">
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Retour à la page précédente
        </button>
      </div>
    </div>
    
    <div class="floating-ideas">
      <div class="floating-idea" v-for="n in 6" :key="n">
        <i class="fas fa-lightbulb"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'

export default {
  name: 'NotFound',
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    isLoggedIn() {
      return this.authStore.isAuthenticated
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    },
    
    performSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({
          path: '/',
          query: { search: this.searchQuery.trim() }
        })
      }
    }
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.not-found-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
}

.error-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 6rem;
  font-weight: 700;
}

.error-number {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: bounce 2s infinite;
}

.error-icon {
  color: #f6ad55;
  animation: pulse 2s infinite;
}

.error-icon i {
  font-size: 4rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.not-found-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.suggestions {
  margin-bottom: 3rem;
}

.suggestions h3 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.suggestion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.suggestion-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
}

.suggestion-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}

.suggestion-card h4 {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.suggestion-card p {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.4;
}

.help-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.help-section h3 {
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.help-section p {
  color: #4a5568;
  margin-bottom: 2rem;
}

.help-section a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.help-section a:hover {
  text-decoration: underline;
}

.search-section h4 {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  max-width: 400px;
  margin: 0 auto;
}

.search-box input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
}

.back-button {
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn:hover {
  transform: translateY(-2px);
}

.floating-ideas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.floating-idea {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: 2rem;
  animation: float 8s ease-in-out infinite;
}

.floating-idea:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-idea:nth-child(2) {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.floating-idea:nth-child(3) {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}

.floating-idea:nth-child(4) {
  bottom: 30%;
  right: 10%;
  animation-delay: 3s;
}

.floating-idea:nth-child(5) {
  bottom: 10%;
  left: 20%;
  animation-delay: 4s;
}

.floating-idea:nth-child(6) {
  top: 40%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-3deg);
  }
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 1rem;
  }
  
  .not-found-content {
    padding: 2rem;
  }
  
  .error-animation {
    font-size: 4rem;
  }
  
  .error-icon i {
    font-size: 3rem;
  }
  
  .not-found-content h1 {
    font-size: 2rem;
  }
  
  .suggestion-cards {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    flex-direction: column;
  }
  
  .search-box input {
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    margin-bottom: 1rem;
  }
  
  .search-btn {
    border-radius: 8px;
  }
}
</style>
