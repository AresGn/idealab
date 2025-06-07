import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store'
import Home from '../views/Home.vue'
import SubmitIdea from '../views/SubmitIdea.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import AllIdeas from '../views/AllIdeas.vue'
import IdeasInDevelopment from '../views/IdeasInDevelopment.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/submit',
    name: 'SubmitIdea',
    component: SubmitIdea,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/all-ideas',
    name: 'AllIdeas',
    component: AllIdeas,
    meta: { requiresAuth: false }
  },
  {
    path: '/ideas-in-development',
    name: 'IdeasInDevelopment',
    component: IdeasInDevelopment,
    meta: { requiresAuth: false }
  },
  {
    path: '/idea/:id',
    name: 'IdeaDetail',
    component: () => import('../views/IdeaDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/edit-idea/:id',
    name: 'EditIdea',
    component: () => import('../views/EditIdea.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guards de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialiser l'authentification si ce n'est pas déjà fait
  if (!authStore.initialized) {
    await authStore.initializeAuth()
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Rediriger vers la page de connexion
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Rediriger les utilisateurs connectés loin des pages d'auth
  if (to.meta.redirectIfAuth && authStore.isLoggedIn) {
    // Si l'utilisateur vient d'une redirection, aller à cette page
    const redirectPath = to.query.redirect || '/dashboard'
    next(redirectPath)
    return
  }

  next()
})

export default router
