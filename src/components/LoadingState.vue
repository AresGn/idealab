<template>
  <div class="loading-state" :class="[`type-${type}`, `size-${size}`]">
    <div class="loading-content">
      <!-- Icône ou spinner -->
      <div class="loading-icon">
        <LoadingSpinner 
          :variant="spinnerVariant" 
          :size="spinnerSize"
          :show-text="false"
        />
      </div>

      <!-- Titre principal -->
      <h3 v-if="title" class="loading-title">
        {{ title }}
      </h3>

      <!-- Description -->
      <p v-if="description" class="loading-description">
        {{ description }}
      </p>

      <!-- Barre de progression (optionnelle) -->
      <div v-if="showProgress && progress !== null" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>

      <!-- Actions optionnelles -->
      <div v-if="$slots.actions" class="loading-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'LoadingState',
  components: {
    LoadingSpinner
  },
  props: {
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'fullscreen', 'inline', 'card'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    title: {
      type: String,
      default: 'Chargement...'
    },
    description: {
      type: String,
      default: ''
    },
    spinnerVariant: {
      type: String,
      default: 'spinner'
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: null
    }
  },
  computed: {
    spinnerSize() {
      const sizeMap = {
        small: 'small',
        medium: 'medium',
        large: 'large'
      }
      return sizeMap[this.size] || 'medium'
    }
  }
}
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

/* Types de layout */
.type-default {
  padding: 2rem;
  min-height: 200px;
}

.type-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.type-inline {
  padding: 1rem;
  min-height: auto;
}

.type-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  padding: 2rem;
  margin: 1rem;
}

/* Tailles */
.size-small .loading-content {
  gap: 0.75rem;
}

.size-medium .loading-content {
  gap: 1rem;
}

.size-large .loading-content {
  gap: 1.5rem;
}

/* Icône de chargement */
.loading-icon {
  margin-bottom: 0.5rem;
}

/* Titre */
.loading-title {
  margin: 0;
  font-weight: 600;
  color: #2d3748;
}

.size-small .loading-title {
  font-size: 1rem;
}

.size-medium .loading-title {
  font-size: 1.25rem;
}

.size-large .loading-title {
  font-size: 1.5rem;
}

/* Description */
.loading-description {
  margin: 0;
  color: #718096;
  line-height: 1.5;
}

.size-small .loading-description {
  font-size: 0.875rem;
}

.size-medium .loading-description {
  font-size: 1rem;
}

.size-large .loading-description {
  font-size: 1.125rem;
}

/* Barre de progression */
.progress-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: progressShimmer 2s infinite;
}

@keyframes progressShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
  align-self: center;
}

/* Actions */
.loading-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Animations d'entrée */
.loading-state {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .type-default,
  .type-card {
    padding: 1.5rem;
  }
  
  .loading-content {
    max-width: 300px;
  }
  
  .size-large .loading-title {
    font-size: 1.25rem;
  }
  
  .size-large .loading-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .type-default,
  .type-card {
    padding: 1rem;
  }
  
  .loading-content {
    max-width: 250px;
  }
}

/* Variantes de couleur pour différents contextes */
.loading-state.variant-primary .progress-fill {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.loading-state.variant-success .progress-fill {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.loading-state.variant-warning .progress-fill {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.loading-state.variant-error .progress-fill {
  background: linear-gradient(135deg, #e53e3e, #c53030);
}
</style>
