import { defineStore } from 'pinia'
import axios from 'axios'

// Configuration axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Store principal pour l'authentification
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user && state.isAuthenticated,
    userRole: (state) => state.user?.role || 'user',
    userName: (state) => {
      if (!state.user) return ''
      return state.user.first_name && state.user.last_name
        ? `${state.user.first_name} ${state.user.last_name}`
        : state.user.username
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        // Support pour les deux formats : objet credentials ou email/password séparés
        const loginData = typeof credentials === 'object' && credentials.email
          ? { email: credentials.email, password: credentials.password }
          : { email: arguments[0], password: arguments[1] }

        const response = await api.post('/auth/login', loginData)
        const { user, token } = response.data

        this.user = user
        this.token = token
        this.isAuthenticated = true

        // Gérer le "Se souvenir de moi"
        if (credentials.rememberMe) {
          localStorage.setItem('auth_token', token)
        } else {
          sessionStorage.setItem('auth_token', token)
        }

        return { success: true, user }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur de connexion'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.post('/auth/register', userData)
        const { user, token } = response.data
        
        this.user = user
        this.token = token
        this.isAuthenticated = true
        
        localStorage.setItem('auth_token', token)
        
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur d\'inscription'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async initializeAuth() {
      if (this.initialized) return

      try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        if (token) {
          this.token = token
          await this.fetchUser()
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
        this.logout()
      } finally {
        this.initialized = true
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
        this.isAuthenticated = true
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      this.initialized = false

      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    },

    clearError() {
      this.error = null
    }
  }
})

// Store pour les idées
export const useIdeasStore = defineStore('ideas', {
  state: () => ({
    ideas: [],
    currentIdea: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {
      sector: '',
      status: 'approved',
      sort: 'created_at',
      order: 'DESC'
    }
  }),

  getters: {
    popularIdeas: (state) => {
      return [...state.ideas]
        .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
        .slice(0, 5)
    },
    
    recentIdeas: (state) => {
      return [...state.ideas]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    }
  },

  actions: {
    async fetchIdeas(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const queryParams = { ...this.filters, ...params }
        const response = await api.get('/ideas', { params: queryParams })
        
        this.ideas = response.data.ideas
        this.pagination = response.data.pagination
        
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors du chargement des idées'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchIdea(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get(`/ideas/${id}`)
        this.currentIdea = response.data
        
        return { success: true, idea: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors du chargement de l\'idée'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createIdea(ideaData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/ideas', ideaData)

        // Ajouter la nouvelle idée à la liste
        this.ideas.unshift(response.data.idea)

        return { success: true, idea: response.data.idea }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors de la création de l\'idée'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchIdeasInDevelopment(params = {}) {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          status: params.status || 'all',
          sort: params.sort || 'progress'
        }

        const response = await api.get('/ideas/in-development', { params: queryParams })

        return {
          success: true,
          data: response.data
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors du chargement des idées en développement'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateIdea(id, ideaData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.put(`/ideas/${id}`, ideaData)
        
        // Mettre à jour l'idée dans la liste
        const index = this.ideas.findIndex(idea => idea.id === id)
        if (index !== -1) {
          this.ideas[index] = response.data.idea
        }
        
        // Mettre à jour l'idée courante si c'est la même
        if (this.currentIdea?.id === id) {
          this.currentIdea = response.data.idea
        }
        
        return { success: true, idea: response.data.idea }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors de la modification de l\'idée'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    clearError() {
      this.error = null
    }
  }
})

// Store pour les statistiques
export const useStatsStore = defineStore('stats', {
  state: () => ({
    overview: {
      total_ideas: 0,
      total_users: 0,
      total_votes: 0,
      total_comments: 0
    },
    loading: false,
    error: null
  }),

  actions: {
    async fetchOverview() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/ideas/stats/overview')
        this.overview = response.data
        
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors du chargement des statistiques'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})

// Export de l'instance axios pour utilisation directe si nécessaire
export { api }
