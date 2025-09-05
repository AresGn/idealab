<template>
  <div class="submit-idea">
    <div class="form-container">
      <h1>
        <i class="fas fa-lightbulb"></i>
        Soumettre une nouvelle idée
      </h1>
      <p class="form-description">
        Partagez votre idée innovante avec la communauté. 
        Plus votre description est détaillée, plus elle aura de chances d'être bien comprise et soutenue.
      </p>

      <form @submit.prevent="submitIdea" class="idea-form">
        <div class="form-group">
          <label for="title">Titre de l'idée *</label>
          <input 
            type="text" 
            id="title"
            v-model="form.title"
            placeholder="Ex: Application de covoiturage pour zones rurales"
            required
            maxlength="100"
          >
          <small>{{ form.title.length }}/100 caractères</small>
        </div>

        <div class="form-group">
          <label for="sector">Secteur concerné *</label>
          <select id="sector" v-model="form.sector" required>
            <option value="">Sélectionnez un secteur</option>
            <option value="Agriculture">🌾 Agriculture</option>
            <option value="Santé">🏥 Santé</option>
            <option value="Éducation">📚 Éducation</option>
            <option value="Finance">💰 Finance</option>
            <option value="Transport">🚗 Transport</option>
            <option value="Énergie">⚡ Énergie</option>
            <option value="Technologie">💻 Technologie</option>
            <option value="Commerce">🛒 Commerce</option>
            <option value="Environnement">🌍 Environnement</option>
            <option value="Philanthropie">❤️ Philanthropie</option>
            <option value="Autre">🔧 Autre</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description détaillée *</label>
          <textarea 
            id="description"
            v-model="form.description"
            placeholder="Décrivez votre idée en détail : le problème qu'elle résout, comment elle fonctionne, qui sont les bénéficiaires..."
            required
            rows="6"
            maxlength="1000"
          ></textarea>
          <small>{{ form.description.length }}/1000 caractères</small>
        </div>

        <div class="form-group">
          <label for="target">Public cible</label>
          <input 
            type="text" 
            id="target"
            v-model="form.target"
            placeholder="Ex: Agriculteurs ruraux, Étudiants, PME..."
          >
        </div>

        <div class="form-group">
          <label for="willingness">Volonté de payer pour une solution</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" v-model="form.willingness" value="high">
              <span>🟢 Forte - Je paierais volontiers pour cette solution</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="form.willingness" value="medium">
              <span>🟡 Modérée - Je pourrais payer selon le prix</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="form.willingness" value="low">
              <span>🔴 Faible - Je préférerais une solution gratuite</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="form.willingness" value="unknown">
              <span>❓ Je ne sais pas</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="budget">Budget estimé (optionnel)</label>
          <input 
            type="text" 
            id="budget"
            v-model="form.budget"
            placeholder="Ex: 50 000 FCFA, 100 USD..."
          >
        </div>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-secondary">
            🔄 Réinitialiser
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '⏳ Envoi...' : '🚀 Soumettre l\'idée' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useIdeasStore, useAuthStore } from '../store'

export default {
  name: 'SubmitIdea',
  data() {
    return {
      isSubmitting: false,
      form: {
        title: '',
        sector: '',
        description: '',
        target: '',
        willingness: '',
        budget: ''
      }
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    ideasStore() {
      return useIdeasStore()
    }
  },
  methods: {
    async submitIdea() {
      if (!this.authStore.isLoggedIn) {
        this.$router.push('/login')
        return
      }

      this.isSubmitting = true

      try {
        const result = await this.ideasStore.createIdea({
          title: this.form.title,
          description: this.form.description,
          sector: this.form.sector,
          target_audience: this.form.target,
          willingness_to_pay: this.form.willingness,
          estimated_budget: this.form.budget
        })

        if (result.success) {
          alert('🎉 Votre idée a été publiée avec succès et est maintenant visible par tous !')
          this.resetForm()
          this.$router.push({
            path: '/dashboard',
            query: {
              message: 'Idée publiée automatiquement avec succès !',
              type: 'success'
            }
          })
        } else {
          alert('❌ ' + (result.error || 'Une erreur est survenue'))
        }

      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
        alert('❌ Une erreur est survenue. Veuillez réessayer.')
      } finally {
        this.isSubmitting = false
      }
    },
    
    resetForm() {
      this.form = {
        title: '',
        sector: '',
        description: '',
        target: '',
        willingness: '',
        budget: ''
      }
    }
  }
}
</script>

<style scoped>
.submit-idea {
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-container h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.form-description {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.idea-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group small {
  color: #95a5a6;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.radio-option:hover {
  background-color: #f8f9fa;
}

.radio-option input[type="radio"] {
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .form-container {
    padding: 2rem 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
