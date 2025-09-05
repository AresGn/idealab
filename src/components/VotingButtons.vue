<template>
  <div class="voting-container">
    <!-- Votes standards -->
    <div class="voting-section">
      <h4 class="voting-title">
        <i class="fas fa-thumbs-up"></i>
        Votre avis
      </h4>
      <div class="vote-buttons">
        <button
          @click="handleRegularVote('up')"
          :class="['vote-btn', 'vote-up', { active: userVotes.regular_vote === 'up', loading: voting }]"
          :disabled="voting"
        >
          <LoadingSpinner
            v-if="voting && votingType === 'regular_up'"
            variant="dots"
            size="small"
            :show-text="false"
          />
          <i v-else class="fas fa-thumbs-up"></i>
          <span>{{ voteCounts.regular.up }}</span>
        </button>
        <button
          @click="handleRegularVote('down')"
          :class="['vote-btn', 'vote-down', { active: userVotes.regular_vote === 'down', loading: voting }]"
          :disabled="voting"
        >
          <LoadingSpinner
            v-if="voting && votingType === 'regular_down'"
            variant="dots"
            size="small"
            :show-text="false"
          />
          <i v-else class="fas fa-thumbs-down"></i>
          <span>{{ voteCounts.regular.down }}</span>
        </button>
      </div>
    </div>

    <!-- Votes de paiement -->
    <div class="voting-section">
      <h4 class="voting-title">
        <i class="fas fa-coins"></i>
        Seriez-vous prêt à payer pour cette solution ?
      </h4>
      <div class="payment-buttons">
        <button
          @click="handlePaymentVote('would_pay')"
          :class="['payment-btn', 'would-pay', { active: userVotes.payment_vote === 'would_pay', loading: voting }]"
          :disabled="voting"
        >
          <LoadingSpinner
            v-if="voting && votingType === 'payment_would_pay'"
            variant="pulse"
            size="small"
            :show-text="false"
          />
          <i v-else class="fas fa-credit-card"></i>
          <span class="btn-text">Je paierais pour ça</span>
          <span class="vote-count">{{ voteCounts.payment.would_pay }}</span>
        </button>
        <button
          @click="handlePaymentVote('would_not_pay')"
          :class="['payment-btn', 'would-not-pay', { active: userVotes.payment_vote === 'would_not_pay', loading: voting }]"
          :disabled="voting"
        >
          <LoadingSpinner
            v-if="voting && votingType === 'payment_would_not_pay'"
            variant="pulse"
            size="small"
            :show-text="false"
          />
          <i v-else class="fas fa-times-circle"></i>
          <span class="btn-text">Je ne paierais pas</span>
          <span class="vote-count">{{ voteCounts.payment.would_not_pay }}</span>
        </button>
      </div>
    </div>

    <!-- Message informatif pour les utilisateurs anonymes -->
    <div v-if="!isAuthenticated" class="anonymous-info">
      <i class="fas fa-info-circle"></i>
      <span>Vous votez en tant qu'utilisateur anonyme</span>
      <router-link to="/login" class="login-link">
        <i class="fas fa-sign-in-alt"></i>
        Se connecter pour plus de fonctionnalités
      </router-link>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'
import { api } from '../store'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'VotingButtons',
  components: {
    LoadingSpinner
  },
  props: {
    ideaId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      voting: false,
      votingType: null, // Track which specific button is being clicked
      voteCounts: {
        regular: {
          up: 0,
          down: 0
        },
        payment: {
          would_pay: 0,
          would_not_pay: 0
        }
      },
      userVotes: {
        regular_vote: null,
        payment_vote: null
      }
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    isAuthenticated() {
      return this.authStore.isLoggedIn
    }
  },
  async mounted() {
    await this.loadVoteCounts()
    await this.loadUserVotes()
  },
  methods: {
    async loadVoteCounts() {
      try {
        const response = await api.get(`/votes/idea/${this.ideaId}`)
        this.voteCounts = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des votes:', error)
      }
    },

    async loadUserVotes() {
      try {
        const response = await api.get(`/votes/user/${this.ideaId}`)
        this.userVotes = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des votes utilisateur:', error)
        // En cas d'erreur, initialiser avec des valeurs par défaut
        this.userVotes = {
          regular_vote: null,
          payment_vote: null
        }
      }
    },

    async handleRegularVote(voteType) {
      this.voting = true
      this.votingType = `regular_${voteType}`
      try {
        const response = await api.post('/votes/regular', {
          idea_id: this.ideaId,
          vote_type: voteType
        })

        // Mettre à jour l'état local
        if (response.data.action === 'removed') {
          this.userVotes.regular_vote = null
        } else {
          this.userVotes.regular_vote = response.data.vote_type
        }

        // Recharger les compteurs
        await this.loadVoteCounts()

        this.$emit('vote-updated', {
          type: 'regular',
          action: response.data.action,
          vote_type: response.data.vote_type
        })

      } catch (error) {
        console.error('Erreur lors du vote:', error)
        if (error.response?.status === 429) {
          alert('Trop de votes. Veuillez réessayer plus tard.')
        } else if (error.response?.status === 403) {
          alert('Votre adresse IP a été bloquée.')
        } else {
          alert('Erreur lors du vote. Veuillez réessayer.')
        }
      } finally {
        this.voting = false
        this.votingType = null
      }
    },

    async handlePaymentVote(voteType) {
      this.voting = true
      this.votingType = `payment_${voteType}`
      try {
        const response = await api.post('/votes/payment', {
          idea_id: this.ideaId,
          vote_type: voteType
        })

        // Mettre à jour l'état local
        if (response.data.action === 'removed') {
          this.userVotes.payment_vote = null
        } else {
          this.userVotes.payment_vote = response.data.vote_type
        }

        // Recharger les compteurs
        await this.loadVoteCounts()

        this.$emit('vote-updated', {
          type: 'payment',
          action: response.data.action,
          vote_type: response.data.vote_type
        })

      } catch (error) {
        console.error('Erreur lors du vote de paiement:', error)
        if (error.response?.status === 429) {
          alert('Trop de votes. Veuillez réessayer plus tard.')
        } else if (error.response?.status === 403) {
          alert('Votre adresse IP a été bloquée.')
        } else {
          alert('Erreur lors du vote. Veuillez réessayer.')
        }
      } finally {
        this.voting = false
        this.votingType = null
      }
    }
  }
}
</script>

<style scoped>
.voting-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
}

.voting-section {
  margin-bottom: 2rem;
}

.voting-section:last-child {
  margin-bottom: 0;
}

.voting-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.vote-buttons {
  display: flex;
  gap: 1rem;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.vote-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vote-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.vote-btn.loading {
  position: relative;
}

.vote-btn.vote-up.active {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-color: #38a169;
  color: white;
}

.vote-btn.vote-down.active {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  border-color: #e53e3e;
  color: white;
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.payment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.payment-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.payment-btn.loading {
  position: relative;
}

.payment-btn.would-pay.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.payment-btn.would-not-pay.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: #f5576c;
  color: white;
}

.btn-text {
  flex: 1;
}

.vote-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
}

.anonymous-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 12px;
  color: #1565c0;
  font-weight: 500;
  font-size: 0.875rem;
}

.login-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .voting-container {
    padding: 1.5rem;
  }
  
  .vote-buttons {
    flex-direction: column;
  }
  
  .payment-btn {
    padding: 0.75rem 1rem;
  }
}
</style>
