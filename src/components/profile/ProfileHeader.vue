<template>
  <div class="profile-header">
    <div class="cover-photo">
      <div class="cover-overlay"></div>
    </div>
    
    <div class="profile-info">
      <div class="avatar-section">
        <div class="avatar">
          <img v-if="user.avatar_url" :src="user.avatar_url" :alt="`${user.first_name} ${user.last_name}`">
          <i v-else class="fas fa-user-circle"></i>
        </div>
        <button v-if="isOwnProfile" @click="$emit('change-avatar')" class="change-avatar-btn">
          <i class="fas fa-camera"></i>
        </button>
      </div>
      
      <div class="user-details">
        <h1>{{ user.first_name }} {{ user.last_name }}</h1>
        <p class="username">@{{ user.username }}</p>
        <p v-if="user.bio" class="bio">{{ user.bio }}</p>
        <div class="join-date">
          <i class="fas fa-calendar-alt"></i>
          Membre depuis {{ formatDate(user.created_at) }}
        </div>
      </div>
      
      <div class="profile-actions">
        <button v-if="isOwnProfile" @click="$emit('edit-profile')" class="btn btn-primary">
          <i class="fas fa-edit"></i>
          Modifier le profil
        </button>
        <button v-else @click="$emit('follow-user')" class="btn btn-outline">
          <i class="fas fa-user-plus"></i>
          Suivre
        </button>
        <button @click="$emit('share-profile')" class="btn btn-secondary">
          <i class="fas fa-share-alt"></i>
          Partager
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    user: {
      type: Object,
      required: true
    },
    isOwnProfile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change-avatar', 'edit-profile', 'follow-user', 'share-profile'],
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
      })
    }
  }
}
</script>

<style scoped>
.profile-header {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

.cover-photo {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.profile-info {
  padding: 2rem;
  position: relative;
  margin-top: -60px;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar i {
  font-size: 4rem;
  color: #cbd5e0;
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

.user-details {
  flex: 1;
  margin-top: 60px;
}

.user-details h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.username {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
}

.bio {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.join-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 60px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
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

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
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
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    margin-top: -40px;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
  
  .avatar i {
    font-size: 3rem;
  }
  
  .user-details,
  .profile-actions {
    margin-top: 0;
  }
  
  .profile-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .user-details h1 {
    font-size: 1.5rem;
  }
}
</style>
