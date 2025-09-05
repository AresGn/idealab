<template>
  <div class="profile-page">
    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Chargement du profil...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2>Erreur</h2>
      <p>{{ error }}</p>
      <button @click="loadProfile" class="btn btn-primary">
        <i class="fas fa-redo"></i>
        Réessayer
      </button>
    </div>

    <!-- Contenu du profil -->
    <div v-else-if="user" class="profile-content">
      <!-- En-tête du profil -->
      <ProfileHeader
        :user="user"
        :is-own-profile="isOwnProfile"
        @change-avatar="changeAvatar"
        @edit-profile="editProfile"
        @follow-user="followUser"
        @share-profile="shareProfile"
      />

      <!-- Navigation des onglets -->
      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Onglet Vue d'ensemble -->
        <div v-if="activeTab === 'overview'" class="tab-panel">
          <ProfileStats
            :stats="userStats"
            :user-ideas="userIdeas"
          />
        </div>

        <!-- Onglet Idées -->
        <div v-if="activeTab === 'ideas'" class="tab-panel">
          <UserIdeasList
            :ideas="userIdeas"
            :user-name="user.first_name"
            :is-own-profile="isOwnProfile"
            :loading="ideasLoading"
            @edit-idea="editIdea"
            @delete-idea="deleteIdea"
            @view-idea="viewIdea"
          />
        </div>

        <!-- Onglet Activité -->
        <div v-if="activeTab === 'activity'" class="tab-panel">
          <div class="activity-feed">
            <h3>
              <i class="fas fa-clock"></i>
              Activité récente
            </h3>
            <div v-if="recentActivity.length === 0" class="empty-activity">
              <i class="fas fa-history"></i>
              <p>Aucune activité récente</p>
            </div>
            <div v-else class="activity-list">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <p>{{ activity.message }}</p>
                  <span class="activity-date">{{ formatDate(activity.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Paramètres (seulement pour son propre profil) -->
        <div v-if="activeTab === 'settings' && isOwnProfile" class="tab-panel">
          <div class="settings-panel">
            <h3>
              <i class="fas fa-cog"></i>
              Paramètres du profil
            </h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Prénom</label>
                <input v-model="editForm.first_name" type="text" />
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input v-model="editForm.last_name" type="text" />
              </div>
              <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input v-model="editForm.username" type="text" />
              </div>
              <div class="form-group">
                <label>Bio</label>
                <textarea v-model="editForm.bio" rows="4"></textarea>
              </div>
              <div class="form-actions">
                <button @click="saveProfile" class="btn btn-primary" :disabled="saving">
                  <i class="fas fa-save"></i>
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
                <button @click="resetForm" class="btn btn-secondary">
                  <i class="fas fa-undo"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useIdeasStore, useStatsStore } from '@/store'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileStats from '../components/profile/ProfileStats.vue'
import UserIdeasList from '../components/profile/UserIdeasList.vue'
import { showSuccess } from '../components/AlertSystem.vue'

export default {
  name: 'Profile',
  components: {
    ProfileHeader,
    ProfileStats,
    UserIdeasList
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const ideasStore = useIdeasStore()
    const statsStore = useStatsStore()
    
    // État réactif
    const loading = ref(true)
    const ideasLoading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const user = ref(null)
    const userIdeas = ref([])
    const userStats = ref({})
    const recentActivity = ref([])
    const activeTab = ref('overview')
    
    // Formulaire d'édition
    const editForm = ref({
      first_name: '',
      last_name: '',
      username: '',
      bio: ''
    })
    
    // Onglets
    const tabs = computed(() => {
      const baseTabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: 'fas fa-chart-bar' },
        { id: 'ideas', label: 'Idées', icon: 'fas fa-lightbulb' },
        { id: 'activity', label: 'Activité', icon: 'fas fa-clock' }
      ]
      
      if (isOwnProfile.value) {
        baseTabs.push({ id: 'settings', label: 'Paramètres', icon: 'fas fa-cog' })
      }
      
      return baseTabs
    })
    
    // Propriétés calculées
    const profileUserId = computed(() => {
      return route.params.id || authStore.user?.id
    })
    
    const isOwnProfile = computed(() => {
      return !route.params.id || route.params.id == authStore.user?.id
    })
    
    // Méthodes
    const loadProfile = async () => {
      loading.value = true
      error.value = null
      
      try {
        const userId = profileUserId.value
        
        if (isOwnProfile.value) {
          // Profil personnel
          user.value = authStore.user
          await loadUserStats(userId)
        } else {
          // Profil d'un autre utilisateur
          const response = await fetch(`/api/users/profile/${userId}`)
          if (response.ok) {
            user.value = await response.json()
            await loadUserStats(userId)
          } else {
            throw new Error('Utilisateur non trouvé')
          }
        }
        
        await loadUserIdeas(userId)
        generateRecentActivity()
        
        // Initialiser le formulaire d'édition
        if (isOwnProfile.value) {
          editForm.value = {
            first_name: user.value.first_name || '',
            last_name: user.value.last_name || '',
            username: user.value.username || '',
            bio: user.value.bio || ''
          }
        }
        
      } catch (err) {
        error.value = err.message || 'Erreur lors du chargement du profil'
        console.error('Erreur:', err)
      } finally {
        loading.value = false
      }
    }
    
    const loadUserStats = async (userId) => {
      try {
        const result = await statsStore.fetchUserStats(userId)
        if (result.success) {
          userStats.value = statsStore.userStats
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err)
      }
    }
    
    const loadUserIdeas = async (userId) => {
      ideasLoading.value = true
      try {
        await ideasStore.fetchIdeas({ user_id: userId, limit: 50 })
        userIdeas.value = ideasStore.ideas.filter(idea => idea.user_id == userId)
      } catch (err) {
        console.error('Erreur lors du chargement des idées:', err)
      } finally {
        ideasLoading.value = false
      }
    }
    
    const generateRecentActivity = () => {
      const activities = []
      
      userIdeas.value.slice(0, 5).forEach(idea => {
        activities.push({
          id: `idea-${idea.id}`,
          icon: 'fas fa-lightbulb',
          message: `Idée "${idea.title}" soumise`,
          date: idea.created_at
        })
      })
      
      recentActivity.value = activities.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
    
    const changeAvatar = () => {
      // Logique pour changer l'avatar
      console.log('Changer l\'avatar')
    }
    
    const editProfile = () => {
      activeTab.value = 'settings'
    }
    
    const followUser = () => {
      // Logique pour suivre un utilisateur
      console.log('Suivre l\'utilisateur')
    }
    
    const shareProfile = () => {
      // Logique pour partager le profil
      if (navigator.share) {
        navigator.share({
          title: `Profil de ${user.value.first_name} ${user.value.last_name}`,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        showSuccess('Lien copié dans le presse-papiers', 'Partage')
      }
    }
    
    const editIdea = (ideaId) => {
      router.push(`/edit-idea/${ideaId}`)
    }
    
    const deleteIdea = async (ideaId) => {
      try {
        // Logique pour supprimer une idée
        await ideasStore.deleteIdea(ideaId)
        await loadUserIdeas(profileUserId.value)
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
      }
    }
    
    const viewIdea = (ideaId) => {
      router.push(`/idea/${ideaId}`)
    }
    
    const saveProfile = async () => {
      saving.value = true
      try {
        // Logique pour sauvegarder le profil
        console.log('Sauvegarder le profil:', editForm.value)
        // Ici, vous appelleriez l'API pour mettre à jour le profil
      } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err)
      } finally {
        saving.value = false
      }
    }
    
    const resetForm = () => {
      editForm.value = {
        first_name: user.value.first_name || '',
        last_name: user.value.last_name || '',
        username: user.value.username || '',
        bio: user.value.bio || ''
      }
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Watchers
    watch(() => route.params.id, () => {
      loadProfile()
    })
    
    // Lifecycle
    onMounted(() => {
      loadProfile()
    })
    
    return {
      loading,
      ideasLoading,
      saving,
      error,
      user,
      userIdeas,
      userStats,
      recentActivity,
      activeTab,
      tabs,
      editForm,
      isOwnProfile,
      loadProfile,
      changeAvatar,
      editProfile,
      followUser,
      shareProfile,
      editIdea,
      deleteIdea,
      viewIdea,
      saveProfile,
      resetForm,
      formatDate
    }
  }
}
</script>

<style>
@import '../styles/profile.css';
</style>
