<template>
  <div class="submit-idea-dt">
    <div class="form-container">
      <!-- Header -->
      <div class="header">
        <h1>
          <i class="fas fa-brain"></i>
          Créer une idée avec Design Thinking
        </h1>
        <p class="form-description">
          Suivez les 3 premières étapes du Design Thinking pour structurer votre idée et maximiser son impact.
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="step"
            :class="{ 
              active: currentStep === index, 
              completed: currentStep > index,
              accessible: index <= maxAccessibleStep
            }"
            @click="goToStep(index)"
          >
            <div class="step-circle">
              <i :class="step.icon"></i>
            </div>
            <span class="step-label">{{ step.name }}</span>
          </div>
        </div>
      </div>

      <!-- Form Steps -->
      <form @submit.prevent="submitIdea" class="idea-form">
        
        <!-- Step 1: EMPATHIZE -->
        <div v-show="currentStep === 0" class="step-content">
          <div class="step-header">
            <h2>🎯 EMPATHIZE - Comprendre les utilisateurs</h2>
            <p>Identifiez qui est concerné par le problème et comprenez leurs besoins.</p>
          </div>

          <div class="form-group">
            <label for="empathy_target_users">Qui est concerné par ce problème ? *</label>
            <textarea 
              id="empathy_target_users"
              v-model="form.empathy_target_users"
              placeholder="Ex: Les agriculteurs des zones rurales, les étudiants universitaires, les personnes âgées..."
              rows="4"
              required
            ></textarea>
            <small class="help-text">Décrivez précisément votre public cible</small>
          </div>

          <div class="form-group">
            <label for="empathy_needs_frustrations">Quels sont leurs besoins et frustrations ? *</label>
            <textarea 
              id="empathy_needs_frustrations"
              v-model="form.empathy_needs_frustrations"
              placeholder="Ex: Besoin d'accès rapide à l'information, frustration liée aux coûts élevés, manque de temps..."
              rows="4"
              required
            ></textarea>
            <small class="help-text">Listez les besoins non satisfaits et les points de douleur</small>
          </div>

          <div class="form-group">
            <label for="empathy_usage_context">Dans quel contexte utilisent-ils cette solution ? *</label>
            <textarea 
              id="empathy_usage_context"
              v-model="form.empathy_usage_context"
              placeholder="Ex: En déplacement, à domicile, au travail, dans des zones sans internet..."
              rows="3"
              required
            ></textarea>
            <small class="help-text">Décrivez l'environnement et les conditions d'usage</small>
          </div>
        </div>

        <!-- Step 2: DEFINE -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="step-header">
            <h2>🔍 DEFINE - Définir le problème</h2>
            <p>Formulez clairement le problème à résoudre et son importance.</p>
          </div>

          <div class="form-group">
            <label for="define_problem_statement">Quel est le problème exact ? *</label>
            <textarea 
              id="define_problem_statement"
              v-model="form.define_problem_statement"
              placeholder="Ex: Les agriculteurs n'ont pas accès à des informations météo précises pour optimiser leurs cultures..."
              rows="4"
              required
            ></textarea>
            <small class="help-text">Énoncez le problème de manière claire et spécifique</small>
          </div>

          <div class="form-group">
            <label for="define_importance_reason">Pourquoi est-ce important ? *</label>
            <textarea 
              id="define_importance_reason"
              v-model="form.define_importance_reason"
              placeholder="Ex: Cela impacte la sécurité alimentaire, génère des pertes économiques, affecte l'environnement..."
              rows="4"
              required
            ></textarea>
            <small class="help-text">Expliquez l'impact et les enjeux</small>
          </div>

          <div class="form-group">
            <label for="define_objective">Quel objectif voulez-vous atteindre ? *</label>
            <textarea 
              id="define_objective"
              v-model="form.define_objective"
              placeholder="Ex: Réduire les pertes agricoles de 30%, améliorer l'accès à l'information..."
              rows="3"
              required
            ></textarea>
            <small class="help-text">Définissez un objectif mesurable et réalisable</small>
          </div>
        </div>

        <!-- Step 3: IDEATE -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="step-header">
            <h2>💡 IDEATE - Proposer des solutions</h2>
            <p>Présentez votre solution et les alternatives que vous avez considérées.</p>
          </div>

          <div class="form-group">
            <label for="title">Titre de votre idée *</label>
            <input 
              type="text" 
              id="title"
              v-model="form.title"
              placeholder="Ex: Application météo intelligente pour agriculteurs"
              required
              maxlength="200"
            >
            <small>{{ form.title.length }}/200 caractères</small>
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
            <label for="ideate_proposed_solution">Votre solution proposée *</label>
            <textarea 
              id="ideate_proposed_solution"
              v-model="form.ideate_proposed_solution"
              placeholder="Ex: Une application mobile qui utilise l'IA pour fournir des prévisions météo hyperlocales..."
              rows="5"
              required
            ></textarea>
            <small class="help-text">Décrivez votre solution en détail</small>
          </div>

          <div class="form-group">
            <label for="ideate_alternatives_considered">Alternatives que vous avez considérées</label>
            <textarea 
              id="ideate_alternatives_considered"
              v-model="form.ideate_alternatives_considered"
              placeholder="Ex: SMS automatiques, site web, partenariat avec stations météo existantes..."
              rows="3"
            ></textarea>
            <small class="help-text">Quelles autres solutions avez-vous envisagées ?</small>
          </div>

          <div class="form-group">
            <label for="ideate_inspiration_references">Inspiration et références</label>
            <textarea 
              id="ideate_inspiration_references"
              v-model="form.ideate_inspiration_references"
              placeholder="Ex: Inspiré par Weather.com, étude de cas de FarmLogs, article sur l'agriculture de précision..."
              rows="3"
            ></textarea>
            <small class="help-text">Sources d'inspiration, références, exemples similaires</small>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="form-navigation">
          <button 
            type="button" 
            @click="previousStep" 
            v-if="currentStep > 0"
            class="btn btn-secondary"
          >
            <i class="fas fa-arrow-left"></i>
            Précédent
          </button>
          
          <button 
            type="button" 
            @click="nextStep" 
            v-if="currentStep < steps.length - 1"
            class="btn btn-primary"
            :disabled="!isCurrentStepValid"
          >
            Suivant
            <i class="fas fa-arrow-right"></i>
          </button>
          
          <button 
            type="submit" 
            v-if="currentStep === steps.length - 1"
            class="btn btn-success"
            :disabled="!isFormValid || submitting"
          >
            <i class="fas fa-paper-plane"></i>
            {{ submitting ? 'Envoi...' : 'Soumettre l\'idée' }}
          </button>
        </div>

        <!-- Error Messages -->
        <div v-if="errors.general" class="error-message">
          {{ errors.general }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useIdeasStore } from '@/store'

export default {
  name: 'SubmitIdeaDesignThinking',
  setup() {
    const ideasStore = useIdeasStore()
    return { ideasStore }
  },
  data() {
    return {
      currentStep: 0,
      maxAccessibleStep: 0,
      submitting: false,
      errors: {},

      steps: [
        { name: 'Empathie', icon: 'fas fa-heart' },
        { name: 'Définir', icon: 'fas fa-bullseye' },
        { name: 'Idéation', icon: 'fas fa-lightbulb' }
      ],

      form: {
        // Métadonnées
        design_thinking_mode: true,

        // Step 1: EMPATHIZE
        empathy_target_users: '',
        empathy_needs_frustrations: '',
        empathy_usage_context: '',

        // Step 2: DEFINE
        define_problem_statement: '',
        define_importance_reason: '',
        define_objective: '',

        // Step 3: IDEATE
        title: '',
        sector: '',
        ideate_proposed_solution: '',
        ideate_alternatives_considered: '',
        ideate_inspiration_references: '',

        // Champs existants (pour compatibilité)
        description: '', // Sera généré automatiquement
        target_audience: '', // Sera mappé depuis empathy_target_users
        willingness_to_pay: '',
        estimated_budget: ''
      }
    }
  },

  computed: {
    progressPercentage() {
      return ((this.currentStep + 1) / this.steps.length) * 100
    },

    isCurrentStepValid() {
      switch (this.currentStep) {
        case 0: // EMPATHIZE
          return this.form.empathy_target_users.trim() &&
                 this.form.empathy_needs_frustrations.trim() &&
                 this.form.empathy_usage_context.trim()
        case 1: // DEFINE
          return this.form.define_problem_statement.trim() &&
                 this.form.define_importance_reason.trim() &&
                 this.form.define_objective.trim()
        case 2: // IDEATE
          return this.form.title.trim() &&
                 this.form.sector &&
                 this.form.ideate_proposed_solution.trim()
        default:
          return false
      }
    },

    isFormValid() {
      return this.isCurrentStepValid && this.currentStep === this.steps.length - 1
    }
  },

  methods: {
    goToStep(stepIndex) {
      if (stepIndex <= this.maxAccessibleStep) {
        this.currentStep = stepIndex
      }
    },

    nextStep() {
      if (this.isCurrentStepValid && this.currentStep < this.steps.length - 1) {
        this.currentStep++
        this.maxAccessibleStep = Math.max(this.maxAccessibleStep, this.currentStep)
      }
    },

    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    generateDescription() {
      // Génère automatiquement la description à partir des étapes Design Thinking
      const parts = []

      if (this.form.define_problem_statement) {
        parts.push(`**Problème identifié :** ${this.form.define_problem_statement}`)
      }

      if (this.form.empathy_target_users) {
        parts.push(`**Public cible :** ${this.form.empathy_target_users}`)
      }

      if (this.form.ideate_proposed_solution) {
        parts.push(`**Solution proposée :** ${this.form.ideate_proposed_solution}`)
      }

      if (this.form.define_objective) {
        parts.push(`**Objectif :** ${this.form.define_objective}`)
      }

      return parts.join('\n\n')
    },

    async submitIdea() {
      if (!this.isFormValid) return

      this.submitting = true
      this.errors = {}

      try {
        // Préparer les données pour l'API
        const ideaData = {
          ...this.form,
          description: this.generateDescription(),
          target_audience: this.form.empathy_target_users,
          completion_percentage: 60 // 3 étapes sur 5 complétées
        }

        // Appeler l'API pour créer l'idée
        await this.ideasStore.createIdea(ideaData)

        // Rediriger vers le dashboard avec un message de succès
        this.$router.push({
          path: '/dashboard',
          query: {
            message: 'Idée Design Thinking publiée automatiquement avec succès !',
            type: 'success'
          }
        })

      } catch (error) {
        console.error('Erreur lors de la création de l\'idée:', error)
        this.errors.general = 'Erreur lors de la soumission. Veuillez réessayer.'
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.submit-idea-dt {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.header h1 i {
  margin-right: 0.5rem;
  color: #ffd700;
}

.form-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Progress Bar */
.progress-container {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.step.accessible {
  opacity: 0.7;
}

.step.active {
  opacity: 1;
  transform: scale(1.1);
}

.step.completed {
  opacity: 1;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.step.completed .step-circle {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

/* Form Content */
.idea-form {
  padding: 2rem;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.step-header p {
  color: #666;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

/* Responsive */
@media (max-width: 768px) {
  .submit-idea-dt {
    padding: 1rem;
  }

  .form-container {
    border-radius: 15px;
  }

  .header {
    padding: 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .progress-container {
    padding: 1.5rem;
  }

  .step-circle {
    width: 40px;
    height: 40px;
  }

  .step-label {
    font-size: 0.8rem;
  }

  .idea-form {
    padding: 1.5rem;
  }

  .form-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
