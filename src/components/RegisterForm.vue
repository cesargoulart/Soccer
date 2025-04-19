<template>
  <form @submit.prevent="handleRegister" class="auth-form">
    <div class="form-group">
      <label for="register-username">Username</label>
      <input
        type="text"
        id="register-username"
        v-model="username"
        required
        placeholder="Choose a username"
      />
    </div>
    <div class="form-group">
      <label for="register-email">Email</label>
      <input
        type="email"
        id="register-email"
        v-model="email"
        required
        placeholder="Enter your email address"
      />
    </div>
    <div class="form-group">
      <label for="register-password">Password</label>
      <input
        type="password"
        id="register-password"
        v-model="password"
        required
        placeholder="Create a password"
      />
    </div>
    <div class="form-group">
      <label for="register-confirm-password">Confirm Password</label>
      <input
        type="password"
        id="register-confirm-password"
        v-model="confirmPassword"
        required
        placeholder="Confirm your password"
      />
    </div>
    <div class="form-group">
      <label for="register-team">Team</label>
      <input
        type="text"
        id="register-team"
        v-model="team"
        required
        placeholder="Enter your team name"
      />
    </div>
    <button type="submit" class="submit-button">Register</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { auth, db } from '../firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { generateAndSavePlayers } from '../utils/playerGenerator'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const team = ref('') // Add new ref for team
const errorMessage = ref('')

// Define emits
const emit = defineEmits(['register-success']);

const handleRegister = async () => {
  errorMessage.value = '' // Clear previous errors

  // Basic validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username: username.value,
      email: email.value,
      team: team.value, // Add the team field
      // Add any other user data you want to store
    })

    // Generate and save 11 players for the new team
    await generateAndSavePlayers(user.uid);

    // Emit success event instead of alert
    emit('register-success');
    // AuthView's onAuthStateChanged will handle the UI update
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      errorMessage.value = `Registration failed: ${error.message}`
    } else {
      errorMessage.value = 'An unknown registration error occurred.'
    }
  }
}
</script>

<style scoped>
/* Reusing styles from LoginForm.vue for consistency */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #b0b0b0;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #3a3a3a;
  border: 1px solid #555;
  border-radius: 5px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-group input::placeholder {
  color: #777;
}

.submit-button {
  padding: 0.9rem 1.5rem;
  background: linear-gradient(90deg, #28a745, #218838); /* Green gradient for register */
  border: none;
  border-radius: 5px;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease;
  margin-top: 1rem;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(40, 167, 69, 0.2);
}

.error-message {
  color: #ff4d4d;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
