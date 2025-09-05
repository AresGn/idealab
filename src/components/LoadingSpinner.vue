<template>
  <div class="loading-container" :class="[`size-${size}`, `variant-${variant}`]">
    <div v-if="variant === 'spinner'" class="spinner-wrapper">
      <div class="modern-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
    </div>

    <div v-else-if="variant === 'dots'" class="dots-wrapper">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>

    <div v-else-if="variant === 'pulse'" class="pulse-wrapper">
      <div class="pulse-circle"></div>
    </div>

    <div v-else-if="variant === 'wave'" class="wave-wrapper">
      <div class="wave-bar"></div>
      <div class="wave-bar"></div>
      <div class="wave-bar"></div>
      <div class="wave-bar"></div>
      <div class="wave-bar"></div>
    </div>

    <div v-else-if="variant === 'skeleton'" class="skeleton-wrapper">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line medium"></div>
    </div>

    <div v-if="showText && text" class="loading-text">
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    variant: {
      type: String,
      default: 'spinner',
      validator: value => ['spinner', 'dots', 'pulse', 'wave', 'skeleton'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    showText: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* Tailles */
.size-small {
  --spinner-size: 24px;
  --text-size: 0.875rem;
}

.size-medium {
  --spinner-size: 40px;
  --text-size: 1rem;
}

.size-large {
  --spinner-size: 60px;
  --text-size: 1.125rem;
}

/* Spinner moderne avec anneaux */
.spinner-wrapper {
  position: relative;
  width: var(--spinner-size);
  height: var(--spinner-size);
}

.modern-spinner {
  position: relative;
  width: 100%;
  height: 100%;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #667eea;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #764ba2;
  animation-delay: -0.5s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #f093fb;
  animation-delay: -1s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Points animés */
.dots-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dot {
  width: calc(var(--spinner-size) / 4);
  height: calc(var(--spinner-size) / 4);
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Pulse circulaire */
.pulse-wrapper {
  position: relative;
  width: var(--spinner-size);
  height: var(--spinner-size);
}

.pulse-circle {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.pulse-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
  animation-delay: 0.5s;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    opacity: 1;
  }
}

/* Barres d'onde */
.wave-wrapper {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  height: var(--spinner-size);
}

.wave-bar {
  width: calc(var(--spinner-size) / 8);
  height: 60%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: waveStretch 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: -1.2s; }
.wave-bar:nth-child(2) { animation-delay: -1.1s; }
.wave-bar:nth-child(3) { animation-delay: -1.0s; }
.wave-bar:nth-child(4) { animation-delay: -0.9s; }
.wave-bar:nth-child(5) { animation-delay: -0.8s; }

@keyframes waveStretch {
  0%, 40%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  20% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Skeleton loader */
.skeleton-wrapper {
  width: calc(var(--spinner-size) * 3);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: calc(var(--spinner-size) / 4);
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Texte de chargement */
.loading-text {
  font-size: var(--text-size);
  color: #718096;
  font-weight: 500;
  text-align: center;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Variantes de couleur */
.variant-primary .spinner-ring:nth-child(1),
.variant-primary .dot,
.variant-primary .pulse-circle,
.variant-primary .wave-bar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-top-color: #667eea;
}

.variant-success .spinner-ring:nth-child(1),
.variant-success .dot,
.variant-success .pulse-circle,
.variant-success .wave-bar {
  background: linear-gradient(135deg, #48bb78, #38a169);
  border-top-color: #48bb78;
}

.variant-warning .spinner-ring:nth-child(1),
.variant-warning .dot,
.variant-warning .pulse-circle,
.variant-warning .wave-bar {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  border-top-color: #ed8936;
}

.variant-error .spinner-ring:nth-child(1),
.variant-error .dot,
.variant-error .pulse-circle,
.variant-error .wave-bar {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  border-top-color: #e53e3e;
}

/* Responsive */
@media (max-width: 768px) {
  .size-large {
    --spinner-size: 48px;
    --text-size: 1rem;
  }
  
  .size-medium {
    --spinner-size: 32px;
    --text-size: 0.875rem;
  }
  
  .size-small {
    --spinner-size: 20px;
    --text-size: 0.75rem;
  }
}
</style>
