<template>
  <div class="share-container">
    <!-- Bouton principal de partage -->
    <button 
      @click="toggleShareMenu" 
      :class="['share-btn', { active: showShareMenu }]"
      :disabled="loading"
    >
      <LoadingSpinner 
        v-if="loading" 
        variant="dots" 
        size="small" 
        :show-text="false"
      />
      <i v-else class="fas fa-share-alt"></i>
      <span class="share-text">Partager</span>
    </button>

    <!-- Menu de partage -->
    <transition name="share-menu">
      <div v-if="showShareMenu" class="share-menu" @click.stop>
        <div class="share-header">
          <h4>Partager cette idée</h4>
          <button @click="closeShareMenu" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Lien personnalisé -->
        <div class="share-link-section">
          <label class="share-label">Lien de partage :</label>
          <div class="link-container">
            <input 
              ref="shareLink"
              :value="shareUrl" 
              readonly 
              class="share-link-input"
              @click="selectAllText"
            />
            <button 
              @click="copyToClipboard" 
              :class="['copy-btn', { copied: justCopied }]"
              :disabled="copying"
            >
              <i :class="justCopied ? 'fas fa-check' : 'fas fa-copy'"></i>
              {{ justCopied ? 'Copié!' : 'Copier' }}
            </button>
          </div>
          <p class="share-description">
            Ce lien permet d'accéder directement à l'idée et de voter facilement.
          </p>
        </div>

        <!-- Options de partage social -->
        <div class="social-share-section">
          <label class="share-label">Partager sur :</label>
          <div class="social-buttons">
            <button @click="shareOnWhatsApp" class="social-btn whatsapp">
              <i class="fab fa-whatsapp"></i>
              WhatsApp
            </button>
            <button @click="shareOnTwitter" class="social-btn twitter">
              <i class="fab fa-twitter"></i>
              Twitter
            </button>
            <button @click="shareOnFacebook" class="social-btn facebook">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </button>
            <button @click="shareOnLinkedIn" class="social-btn linkedin">
              <i class="fab fa-linkedin-in"></i>
              LinkedIn
            </button>
            <button @click="shareByEmail" class="social-btn email">
              <i class="fas fa-envelope"></i>
              Email
            </button>
          </div>
        </div>

        <!-- Statistiques de partage -->
        <div v-if="shareStats" class="share-stats">
          <small class="stats-text">
            <i class="fas fa-chart-line"></i>
            Cette idée a été partagée {{ shareStats.total_shares || 0 }} fois
          </small>
        </div>
      </div>
    </transition>

    <!-- Overlay pour fermer le menu -->
    <div 
      v-if="showShareMenu" 
      class="share-overlay" 
      @click="closeShareMenu"
    ></div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'
import { api } from '../store'

export default {
  name: 'ShareButton',
  components: {
    LoadingSpinner
  },
  props: {
    idea: {
      type: Object,
      required: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    }
  },
  data() {
    return {
      showShareMenu: false,
      loading: false,
      copying: false,
      justCopied: false,
      shareStats: null
    }
  },
  computed: {
    shareUrl() {
      const baseUrl = window.location.origin
      const ideaSlug = this.createSlug(this.idea.title)
      return `${baseUrl}/idea/${this.idea.id}/${ideaSlug}?utm_source=share&utm_medium=link&utm_campaign=idea_sharing`
    },
    
    shareTitle() {
      return `💡 ${this.idea.title} | IdéaLab`
    },
    
    shareDescription() {
      const description = this.idea.description || 'Découvrez cette idée innovante sur IdéaLab'
      return description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description
    },
    
    shareText() {
      return `${this.shareTitle}\n\n${this.shareDescription}\n\n🗳️ Votez pour cette idée :\n${this.shareUrl}`
    }
  },
  methods: {
    createSlug(title) {
      return title
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
        .substring(0, 50)
    },

    async toggleShareMenu() {
      if (this.showShareMenu) {
        this.closeShareMenu()
      } else {
        await this.openShareMenu()
      }
    },

    async openShareMenu() {
      this.loading = true
      try {
        // Charger les statistiques de partage
        await this.loadShareStats()
        this.showShareMenu = true
        
        // Enregistrer l'ouverture du menu de partage
        await this.trackShareAction('menu_opened')
        
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du menu de partage:', error)
        this.showShareMenu = true // Ouvrir quand même le menu
      } finally {
        this.loading = false
      }
    },

    closeShareMenu() {
      this.showShareMenu = false
      this.justCopied = false
    },

    async loadShareStats() {
      try {
        const response = await api.get(`/ideas/${this.idea.id}/share-stats`)
        this.shareStats = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des stats de partage:', error)
        this.shareStats = { total_shares: 0 }
      }
    },

    selectAllText() {
      this.$refs.shareLink.select()
    },

    async copyToClipboard() {
      if (this.copying) return
      
      this.copying = true
      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.justCopied = true
        
        // Enregistrer l'action de copie
        await this.trackShareAction('link_copied')
        
        // Réinitialiser après 3 secondes
        setTimeout(() => {
          this.justCopied = false
        }, 3000)
        
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
        // Fallback pour les navigateurs plus anciens
        this.$refs.shareLink.select()
        document.execCommand('copy')
        this.justCopied = true
        
        setTimeout(() => {
          this.justCopied = false
        }, 3000)
      } finally {
        this.copying = false
      }
    },

    async shareOnWhatsApp() {
      const url = `https://wa.me/?text=${encodeURIComponent(this.shareText)}`
      await this.openShareWindow(url, 'whatsapp')
    },

    async shareOnTwitter() {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareTitle)}&url=${encodeURIComponent(this.shareUrl)}&hashtags=IdéaLab,Innovation,Afrique`
      await this.openShareWindow(url, 'twitter')
    },

    async shareOnFacebook() {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}&quote=${encodeURIComponent(this.shareTitle)}`
      await this.openShareWindow(url, 'facebook')
    },

    async shareOnLinkedIn() {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}&title=${encodeURIComponent(this.shareTitle)}&summary=${encodeURIComponent(this.shareDescription)}`
      await this.openShareWindow(url, 'linkedin')
    },

    async shareByEmail() {
      const subject = encodeURIComponent(this.shareTitle)
      const body = encodeURIComponent(`Bonjour,\n\nJe voulais partager avec vous cette idée innovante que j'ai trouvée sur IdéaLab :\n\n${this.shareTitle}\n\n${this.shareDescription}\n\nVous pouvez la consulter et voter ici :\n${this.shareUrl}\n\nBonne découverte !\n\n---\nIdéaLab - Plateforme collaborative pour l'Afrique`)
      const url = `mailto:?subject=${subject}&body=${body}`
      
      window.location.href = url
      await this.trackShareAction('email')
    },

    async openShareWindow(url, platform) {
      const width = 600
      const height = 400
      const left = (window.innerWidth - width) / 2
      const top = (window.innerHeight - height) / 2
      
      window.open(
        url,
        `share_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      )
      
      await this.trackShareAction(platform)
    },

    async trackShareAction(action) {
      try {
        await api.post(`/ideas/${this.idea.id}/share`, {
          action: action,
          platform: action,
          share_url: this.shareUrl
        })
      } catch (error) {
        console.error('Erreur lors du tracking de partage:', error)
      }
    }
  },

  // Fermer le menu si on clique ailleurs
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    ...this.methods,
    handleClickOutside(event) {
      if (this.showShareMenu && !this.$el.contains(event.target)) {
        this.closeShareMenu()
      }
    }
  }
}
</script>

<style scoped>
.share-container {
  position: relative;
  display: inline-block;
}

/* Bouton principal */
.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.share-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.share-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.share-btn.active {
  background: linear-gradient(135deg, #764ba2, #667eea);
}

/* Menu de partage */
.share-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  min-width: 350px;
  z-index: 1000;
  overflow: hidden;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.share-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

/* Section lien de partage */
.share-link-section {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.share-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.link-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.share-link-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #f8fafc;
  color: #2d3748;
}

.copy-btn {
  padding: 0.75rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-btn:hover:not(:disabled) {
  background: #38a169;
}

.copy-btn.copied {
  background: #38a169;
}

.share-description {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

/* Boutons sociaux */
.social-share-section {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.social-btn.whatsapp { background: #25d366; }
.social-btn.twitter { background: #1da1f2; }
.social-btn.facebook { background: #1877f2; }
.social-btn.linkedin { background: #0077b5; }
.social-btn.email { background: #ea4335; }

.social-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Statistiques */
.share-stats {
  padding: 0.75rem 1rem;
  background: #f8fafc;
}

.stats-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #718096;
}

/* Overlay */
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

/* Animations */
.share-menu-enter-active,
.share-menu-leave-active {
  transition: all 0.3s ease;
}

.share-menu-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.share-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .share-menu {
    right: -1rem;
    left: -1rem;
    min-width: auto;
    max-width: calc(100vw - 2rem);
  }
  
  .social-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .social-btn {
    font-size: 0.875rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .share-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .share-text {
    display: none;
  }
}
</style>
