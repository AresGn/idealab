<template>
  <teleport to="body">
    <div class="alert-container">
      <transition-group name="alert" tag="div">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="['alert', `alert-${alert.type}`]"
          @click="removeAlert(alert.id)"
        >
          <div class="alert-icon">
            <i :class="getIcon(alert.type)"></i>
          </div>
          <div class="alert-content">
            <h4 v-if="alert.title" class="alert-title">{{ alert.title }}</h4>
            <p class="alert-message">{{ alert.message }}</p>
          </div>
          <button class="alert-close" @click.stop="removeAlert(alert.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { ref, reactive } from 'vue'

// Store global pour les alertes
const alerts = ref([])
let alertId = 0

// Fonction pour ajouter une alerte
export function showAlert(options) {
  const alert = {
    id: ++alertId,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration || 5000,
    persistent: options.persistent || false
  }
  
  alerts.value.push(alert)
  
  // Auto-suppression après la durée spécifiée
  if (!alert.persistent) {
    setTimeout(() => {
      removeAlert(alert.id)
    }, alert.duration)
  }
  
  return alert.id
}

// Fonction pour supprimer une alerte
export function removeAlert(id) {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index > -1) {
    alerts.value.splice(index, 1)
  }
}

// Fonctions de convenance
export function showSuccess(message, title = 'Succès') {
  return showAlert({ type: 'success', title, message })
}

export function showError(message, title = 'Erreur') {
  return showAlert({ type: 'error', title, message, duration: 7000 })
}

export function showWarning(message, title = 'Attention') {
  return showAlert({ type: 'warning', title, message })
}

export function showInfo(message, title = 'Information') {
  return showAlert({ type: 'info', title, message })
}

export default {
  name: 'AlertSystem',
  setup() {
    const getIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || icons.info
    }

    return {
      alerts,
      removeAlert,
      getIcon
    }
  }
}
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  width: 100%;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.alert:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* Types d'alertes */
.alert-success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
  border-left-color: #16a34a;
  color: white;
}

.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
  border-left-color: #dc2626;
  color: white;
}

.alert-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
  border-left-color: #d97706;
  color: white;
}

.alert-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
  border-left-color: #2563eb;
  color: white;
}

.alert-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.alert-message {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
  opacity: 0.95;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
.alert-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.alert-leave-active {
  transition: all 0.3s ease-in;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.alert-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .alert-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .alert {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .alert-title {
    font-size: 0.9rem;
  }
  
  .alert-message {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .alert-container {
    top: 5px;
    right: 5px;
    left: 5px;
  }
  
  .alert {
    padding: 10px;
    gap: 8px;
  }
  
  .alert-icon {
    font-size: 1.1rem;
  }
}
</style>
