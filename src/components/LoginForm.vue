<template>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="login-email">Email or Username</label>
        <input type="text" id="login-email" v-model="emailOrUsername" required placeholder="Enter your email or username" />
      </div>
      <div class="form-group">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" v-model="password" required placeholder="Enter your password" />
      </div>
      <button type="submit" class="submit-button">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  // import { useRouter } from 'vue-router'; // No longer needed
  import { auth } from '@/firebaseConfig';
  import { signInWithEmailAndPassword } from 'firebase/auth';

  const emailOrUsername = ref('');
  const password = ref('');
  const errorMessage = ref('');
  // const router = useRouter(); // No longer needed

  // Define emits
  const emit = defineEmits(['login-success']);

  const handleLogin = async () => {
    errorMessage.value = ''; // Clear previous errors
  
    // Basic validation (can be expanded)
    if (!emailOrUsername.value || !password.value) {
      errorMessage.value = 'Please fill in all fields.';
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, emailOrUsername.value, password.value);
      // Emit success event instead of redirecting
      emit('login-success');
      // AuthView's onAuthStateChanged will handle the UI update
    } catch (error) {
      errorMessage.value = 'Invalid credentials. Please try again.';
    }
  };
  </script>
  
  <style scoped>
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
    box-sizing: border-box; /* Include padding and border in element's total width and height */
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
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
    background: linear-gradient(90deg, #007bff, #0056b3);
    border: none;
    border-radius: 5px;
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.3s ease;
    margin-top: 1rem;
  }
  
  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
  
  .submit-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(0, 123, 255, 0.2);
  }
  
  .error-message {
    color: #ff4d4d;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  </style>
  