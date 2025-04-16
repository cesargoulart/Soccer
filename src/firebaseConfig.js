// src/firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: 'soccer-bd718.firebaseapp.com',
  projectId: 'soccer-bd718',
  storageBucket: 'soccer-bd718.appspot.com',
  messagingSenderId: '89710581780',
  appId: '1:89710581780:web:b31755747a5631dd4d2f01',
  measurementId: 'G-MJTCN4ZQF7',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? `User ${user.uid} logged in` : 'No user')
})

// Initialize auth state
const currentUser = auth.currentUser
console.log('Current auth state:', currentUser ? `User ${currentUser.uid} logged in` : 'No user')

export { auth, db }
