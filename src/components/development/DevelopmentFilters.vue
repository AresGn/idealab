<template>
  <div class="filters-section">
    <div class="filter-group">
      <label>
        <i class="fas fa-filter"></i>
        Statut de développement
      </label>
      <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
        <option value="all">Tous les statuts</option>
        <option value="planning">Planification</option>
        <option value="development">En développement</option>
        <option value="testing">Tests</option>
        <option value="completed">Terminé</option>
        <option value="paused">En pause</option>
      </select>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-sort"></i>
        Trier par
      </label>
      <select :value="filters.sort" @change="updateFilter('sort', $event.target.value)">
        <option value="progress">Progression</option>
        <option value="votes">Popularité</option>
        <option value="start_date">Date de début</option>
        <option value="estimated_completion">Date prévue</option>
      </select>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-search"></i>
        Rechercher
      </label>
      <input
        type="text"
        :value="filters.search"
        @input="updateFilter('search', $event.target.value)"
        placeholder="Rechercher une idée..."
      >
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-percentage"></i>
        Progression minimale
      </label>
      <input
        type="range"
        min="0"
        max="100"
        :value="filters.minProgress"
        @input="updateFilter('minProgress', $event.target.value)"
      >
      <span class="progress-value">{{ filters.minProgress }}%</span>
    </div>

    <div class="filter-actions">
      <button @click="resetFilters" class="btn btn-secondary">
        <i class="fas fa-undo"></i>
        Réinitialiser
      </button>
      <button @click="exportData" class="btn btn-primary">
        <i class="fas fa-download"></i>
        Exporter
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DevelopmentFilters',
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  emits: ['update-filter', 'reset-filters', 'export-data'],
  methods: {
    updateFilter(key, value) {
      this.$emit('update-filter', { key, value })
    },
    resetFilters() {
      this.$emit('reset-filters')
    },
    exportData() {
      this.$emit('export-data')
    }
  }
}
</script>

<style scoped>
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select,
.filter-group input[type="text"] {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.filter-group select:focus,
.filter-group input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
}

.filter-group input[type="range"] {
  width: 100%;
  margin: 0.5rem 0;
}

.progress-value {
  font-weight: 600;
  color: #667eea;
  text-align: center;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

@media (max-width: 768px) {
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: row;
  }
}
</style>
