<template>
  <div class="comments-section">
    <h2>
      <i class="fas fa-comments"></i>
      Commentaires ({{ totalComments }})
    </h2>
    
    <!-- Formulaire d'ajout de commentaire -->
    <div class="add-comment">
      <div class="comment-form">
        <!-- Champs pour utilisateurs anonymes -->
        <div v-if="!isAuthenticated" class="anonymous-fields">
          <div class="field-group">
            <input
              type="text"
              v-model="newComment.authorName"
              placeholder="Votre nom (optionnel)"
              class="name-input"
              maxlength="100"
            >
            <input
              type="email"
              v-model="newComment.authorEmail"
              placeholder="Votre email *"
              class="email-input"
              required
              :class="{ 'error': emailError }"
            >
          </div>
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
        </div>

        <!-- Zone de texte pour le commentaire -->
        <textarea
          v-model="newComment.content"
          placeholder="Ajoutez votre commentaire..."
          rows="3"
          maxlength="2000"
          :class="{ 'error': contentError }"
        ></textarea>
        
        <div v-if="contentError" class="error-message">{{ contentError }}</div>
        
        <div class="comment-actions">
          <div class="character-count">
            {{ newComment.content.length }}/2000
          </div>
          <button
            class="btn btn-primary"
            @click="addComment"
            :disabled="!canSubmit || submitting"
          >
            <LoadingSpinner
              v-if="submitting"
              variant="dots"
              size="small"
              :show-text="false"
            />
            <i v-else class="fas fa-paper-plane"></i>
            {{ submitting ? 'Envoi...' : 'Commenter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des commentaires -->
    <div class="comments-list">
      <LoadingState
        v-if="loading"
        type="inline"
        size="medium"
        title="Chargement des commentaires..."
        description="Veuillez patienter pendant que nous récupérons les commentaires."
        spinner-variant="wave"
      />
      
      <div v-else-if="comments.length === 0" class="empty-state">
        <i class="fas fa-comments"></i>
        <p>Aucun commentaire pour le moment</p>
        <p class="subtitle">Soyez le premier à commenter cette idée !</p>
      </div>
      
      <div v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-header">
            <div class="author-info">
              <span class="author-name">{{ comment.author_name }}</span>
              <span v-if="comment.is_registered_user" class="verified-badge">
                <i class="fas fa-check-circle"></i>
                Utilisateur vérifié
              </span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div v-if="canEditComment(comment)" class="comment-actions">
              <button @click="editComment(comment)" class="btn-icon" title="Modifier">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteComment(comment)" class="btn-icon delete" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>
          
          <div class="comment-footer">
            <button @click="replyToComment(comment)" class="reply-btn">
              <i class="fas fa-reply"></i>
              Répondre
            </button>
            <span v-if="comment.replies_count > 0" class="replies-count">
              {{ comment.replies_count }} réponse(s)
            </span>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="pagination">
          <button 
            @click="loadPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn btn-secondary"
          >
            <i class="fas fa-chevron-left"></i>
            Précédent
          </button>
          
          <span class="page-info">
            Page {{ pagination.page }} sur {{ pagination.pages }}
          </span>
          
          <button 
            @click="loadPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="btn btn-secondary"
          >
            Suivant
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'
import { api } from '../store'
import LoadingSpinner from './LoadingSpinner.vue'
import LoadingState from './LoadingState.vue'
import { showError, showWarning, showSuccess } from './AlertSystem.vue'

export default {
  name: 'CommentsSection',
  components: {
    LoadingSpinner,
    LoadingState
  },
  props: {
    ideaId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      loading: false,
      submitting: false,
      totalComments: 0,
      pagination: {
        page: 1,
        pages: 1,
        total: 0,
        limit: 20
      },
      newComment: {
        content: '',
        authorName: '',
        authorEmail: ''
      },
      emailError: '',
      contentError: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    isAuthenticated() {
      return this.authStore.isLoggedIn
    },
    canSubmit() {
      const hasContent = this.newComment.content.trim().length >= 3
      const hasValidEmail = this.isAuthenticated || this.isValidEmail(this.newComment.authorEmail)
      return hasContent && hasValidEmail && !this.emailError && !this.contentError
    }
  },
  watch: {
    'newComment.content'() {
      this.validateContent()
    },
    'newComment.authorEmail'() {
      this.validateEmail()
    }
  },
  async mounted() {
    await this.loadComments()
  },
  methods: {
    async loadComments(page = 1) {
      this.loading = true
      try {
        const response = await api.get(`/comments/idea/${this.ideaId}?page=${page}&limit=${this.pagination.limit}`)
        this.comments = response.data.comments
        this.pagination = response.data.pagination
        this.totalComments = this.pagination.total
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error)
      } finally {
        this.loading = false
      }
    },

    async loadPage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        await this.loadComments(page)
      }
    },

    validateEmail() {
      if (!this.isAuthenticated && this.newComment.authorEmail) {
        if (!this.isValidEmail(this.newComment.authorEmail)) {
          this.emailError = 'Adresse email invalide'
        } else {
          this.emailError = ''
        }
      } else {
        this.emailError = ''
      }
    },

    validateContent() {
      const content = this.newComment.content.trim()
      if (content.length > 0 && content.length < 3) {
        this.contentError = 'Le commentaire doit contenir au moins 3 caractères'
      } else if (content.length > 2000) {
        this.contentError = 'Le commentaire ne peut pas dépasser 2000 caractères'
      } else {
        this.contentError = ''
      }
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    async addComment() {
      if (!this.canSubmit) return

      this.submitting = true
      try {
        const commentData = {
          idea_id: this.ideaId,
          content: this.newComment.content.trim()
        }

        if (!this.isAuthenticated) {
          commentData.author_email = this.newComment.authorEmail.trim()
          commentData.author_name = this.newComment.authorName.trim() || 'Utilisateur anonyme'
        }

        const response = await api.post('/comments', commentData)
        
        // Réinitialiser le formulaire
        this.newComment = {
          content: '',
          authorName: '',
          authorEmail: ''
        }
        
        // Recharger les commentaires
        await this.loadComments(1)
        
        this.$emit('comment-added', response.data.comment)

      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error)
        if (error.response?.status === 429) {
          this.showWarning('Trop de commentaires. Veuillez réessayer plus tard.', 'Limite atteinte')
        } else if (error.response?.status === 403) {
          this.showError('Votre adresse IP a été bloquée.', 'Accès refusé')
        } else {
          this.showError('Erreur lors de l\'ajout du commentaire. Veuillez réessayer.', 'Erreur de connexion')
        }
      } finally {
        this.submitting = false
      }
    },

    canEditComment(comment) {
      // Les utilisateurs connectés peuvent modifier leurs propres commentaires
      if (this.isAuthenticated && comment.is_registered_user) {
        return true // Simplification - en réalité, il faudrait vérifier l'ID utilisateur
      }
      
      // Les utilisateurs anonymes peuvent modifier leurs commentaires via session
      // Cette vérification sera faite côté serveur
      return !comment.is_registered_user
    },

    editComment(comment) {
      // TODO: Implémenter l'édition de commentaires
      console.log('Éditer commentaire:', comment.id)
    },

    async deleteComment(comment) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        return
      }

      try {
        await api.delete(`/comments/${comment.id}`)
        await this.loadComments(this.pagination.page)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        this.showError('Erreur lors de la suppression du commentaire.', 'Erreur de suppression')
      }
    },

    replyToComment(comment) {
      // TODO: Implémenter les réponses aux commentaires
      console.log('Répondre au commentaire:', comment.id)
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // Méthodes d'alerte
    showError(message, title = 'Erreur') {
      showError(message, title)
    },

    showWarning(message, title = 'Attention') {
      showWarning(message, title)
    },

    showSuccess(message, title = 'Succès') {
      showSuccess(message, title)
    }
  }
}
</script>

<style scoped>
.comments-section {
  margin-top: 2rem;
}

.comments-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.comments-section h2 i {
  color: #667eea;
}

/* Formulaire d'ajout de commentaire */
.add-comment {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.anonymous-fields {
  margin-bottom: 1rem;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.name-input,
.email-input {
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.name-input:focus,
.email-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.email-input.error {
  border-color: #e53e3e;
}

.comment-form textarea {
  padding: 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-form textarea.error {
  border-color: #e53e3e;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-count {
  font-size: 0.75rem;
  color: #718096;
}

.error-message {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* États de chargement et vide */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.empty-state .subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Liste des commentaires */
.comments-list {
  margin-top: 1rem;
}

.comment-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.author-name {
  font-weight: 600;
  color: #2d3748;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #48bb78;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.comment-date {
  color: #718096;
  font-size: 0.875rem;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f7fafc;
  color: #4a5568;
}

.btn-icon.delete:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.comment-content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #4a5568;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.reply-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.reply-btn:hover {
  background: #edf2f7;
}

.replies-count {
  color: #718096;
  font-size: 0.875rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-info {
  color: #718096;
  font-size: 0.875rem;
}

/* Boutons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

/* Responsive */
@media (max-width: 768px) {
  .field-group {
    grid-template-columns: 1fr;
  }

  .comment-header {
    flex-direction: column;
    gap: 1rem;
  }

  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .comment-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
