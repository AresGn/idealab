<template>
  <div class="idea-filters">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Filtres
      </h3>
      <button @click="resetFilters" class="reset-btn">
        <i class="fas fa-undo"></i>
        Réinitialiser
      </button>
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
        class="search-input"
      >
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-tag"></i>
        Secteur
      </label>
      <select :value="filters.sector" @change="updateFilter('sector', $event.target.value)">
        <option value="">Tous les secteurs</option>
        <option v-for="sector in sectors" :key="sector" :value="sector">
          {{ sector }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-check-circle"></i>
        Statut
      </label>
      <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
        <option value="">Tous les statuts</option>
        <option value="approved">Approuvées</option>
        <option value="pending">En attente</option>
        <option value="featured">Mises en avant</option>
      </select>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-sort"></i>
        Trier par
      </label>
      <select :value="filters.sort" @change="updateFilter('sort', $event.target.value)">
        <option value="created_at">Plus récentes</option>
        <option value="votes">Plus populaires</option>
        <option value="comments">Plus commentées</option>
        <option value="views">Plus vues</option>
      </select>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-thumbs-up"></i>
        Votes minimum
      </label>
      <input
        type="range"
        min="0"
        max="100"
        :value="filters.minVotes"
        @input="updateFilter('minVotes', $event.target.value)"
        class="range-input"
      >
      <span class="range-value">{{ filters.minVotes }} votes</span>
    </div>

    <div class="filter-group">
      <label>
        <i class="fas fa-calendar-alt"></i>
        Période
      </label>
      <select :value="filters.period" @change="updateFilter('period', $event.target.value)">
        <option value="">Toutes les périodes</option>
        <option value="today">Aujourd'hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
        <option value="year">Cette année</option>
      </select>
    </div>

    <div class="filter-summary" v-if="hasActiveFilters">
      <p>
        <i class="fas fa-info-circle"></i>
        {{ activeFiltersCount }} filtre(s) actif(s)
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdeaFilters',
  props: {
    filters: {
      type: Object,
      required: true
    },
    sectors: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update-filter', 'reset-filters'],
  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some(value => 
        value !== '' && value !== 0 && value !== null && value !== undefined
      )
    },
    
    activeFiltersCount() {
      return Object.values(this.filters).filter(value => 
        value !== '' && value !== 0 && value !== null && value !== undefined
      ).length
    }
  },
  methods: {
    updateFilter(key, value) {
      this.$emit('update-filter', { key, value })
    },
    
    resetFilters() {
      this.$emit('reset-filters')
    }
  }
}
</script>

<style scoped>
.idea-filters {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input,
.filter-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.search-input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.search-input::placeholder {
  color: #a0aec0;
}

.range-input {
  width: 100%;
  margin: 0.5rem 0;
}

.range-value {
  display: block;
  text-align: center;
  font-weight: 600;
  color: #667eea;
  font-size: 0.875rem;
}

.filter-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
}

.filter-summary p {
  margin: 0;
  color: #38a169;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .idea-filters {
    padding: 1rem;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .reset-btn {
    align-self: stretch;
    justify-content: center;
  }
}

/* Accessibilité */
.search-input:focus,
.filter-group select:focus,
.reset-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Amélioration du contraste */
@media (prefers-contrast: high) {
  .filter-group label,
  .filters-header h3 {
    color: #000;
  }
  
  .search-input::placeholder {
    color: #4a5568;
  }
}
</style>
