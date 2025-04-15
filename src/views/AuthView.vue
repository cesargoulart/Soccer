<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Welcome Message (if logged in) -->
      <div v-if="currentUser" class="welcome-section">
        <h1 class="welcome-title">Welcome, {{ username }}!</h1>
        <p class="welcome-message">You are logged in.</p>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </div>

      <!-- Login/Register Forms (if not logged in) -->
      <div v-else>
        <div class="auth-toggle">
          <button @click="showLogin = true" :class="{ active: showLogin }">Login</button>
          <button @click="showLogin = false" :class="{ active: !showLogin }">Register</button>
        </div>
        <transition name="fade" mode="out-in">
          <div v-if="showLogin" key="login">
            <LoginForm @login-success="handleAuthSuccess" />
          </div>
          <div v-else key="register">
            <RegisterForm @register-success="handleAuthSuccess" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import LoginForm from '@/components/LoginForm.vue';
import RegisterForm from '@/components/RegisterForm.vue';

const showLogin = ref(true);
const currentUser = ref<User | null>(null);
const username = ref<string>('User');
const auth = getAuth();
let unsubscribeAuth: (() => void) | null = null;

// --- Authentication Handling ---
onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) {
      username.value = user.displayName || user.email || 'User';
    } else {
      username.value = 'User'; // Reset username on logout
      showLogin.value = true; // Default to login view when logged out
    }
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    // onAuthStateChanged will handle the UI update
  } catch (error) {
    console.error('Logout failed:', error);
    // Optionally show an error message to the user
  }
};

// This function might not be strictly necessary if onAuthStateChanged covers it,
// but can be used for immediate UI feedback if needed.
const handleAuthSuccess = () => {
  // The onAuthStateChanged listener should automatically update the UI.
  // We could potentially force a refresh or update state here if needed,
  // but usually it's not required.
  console.log('Auth success detected in AuthView');
};

</script>

<style scoped>
/* Keep existing styles for .auth-container, .auth-card, .auth-toggle, buttons */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #1a1a2e; /* Darker theme background */
  padding: 2rem;
  animation: fadeIn 0.5s ease-in-out;
}

.auth-card {
  background-color: #2c2c3e; /* Slightly lighter dark card */
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  color: #e0e0e0; /* Light text */
  width: 100%;
  max-width: 480px;
  text-align: center;
  overflow: hidden; /* For transition */
  border: 1px solid #444;
}

.auth-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #555;
  background-color: #1f1f2f;
}

.auth-toggle button {
  flex: 1;
  padding: 0.9rem 1rem;
  background-color: transparent;
  border: none;
  color: #a0a0c0;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-right: 1px solid #555; /* Separator */
}
.auth-toggle button:last-child {
  border-right: none;
}

.auth-toggle button.active {
  background-color: #4ecca3; /* Accent color */
  color: #1a1a2e; /* Dark text on active */
}

.auth-toggle button:not(.active):hover {
  background-color: #3a3a4e;
  color: #fff;
}

/* Welcome Section Styles */
.welcome-section {
  padding: 20px;
  animation: slideInUp 0.6s ease-out;
}

.welcome-title {
  font-size: 2.5em;
  color: #4ecca3; /* Accent color */
  margin-bottom: 15px;
  text-shadow: 0 0 8px rgba(78, 204, 163, 0.4);
}

.welcome-message {
  font-size: 1.1em;
  color: #b0b0d0; /* Slightly lighter text */
  margin-bottom: 25px;
}

.logout-button {
  padding: 0.8rem 1.8rem;
  background: linear-gradient(90deg, #ff4d4d, #cc0000); /* Red gradient for logout */
  border: none;
  border-radius: 5px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  margin-top: 1rem;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.4);
}

.logout-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(255, 77, 77, 0.3);
}


/* Basic fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Keyframe animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>