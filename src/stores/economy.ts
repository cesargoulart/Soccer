import { defineStore } from 'pinia'
import { ref, watch } from 'vue';
import { doc, onSnapshot, setDoc, getDoc, type DocumentReference, type DocumentSnapshot, type FirestoreError } from 'firebase/firestore'; // Import necessary types
import { db, auth } from '../firebaseConfig'; // Assuming firebaseConfig exports auth
import { onAuthStateChanged, type User } from 'firebase/auth'

export interface EconomyData {
  lucros?: number
  despesas?: number
  publicidade?: number
  vendasCompras?: number
  staff?: number
  // Add other fields as needed
}

// Default economy data if none exists in Firestore
const defaultEconomy: EconomyData = {
  lucros: 0,
  despesas: 0,
  publicidade: 0,
  vendasCompras: 0,
  staff: 0,
}

export const useEconomyStore = defineStore('economy', () => {
  const economyData = ref<EconomyData | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  let unsubscribeFromEconomy: (() => void) | null = null
  const currentUser = ref<User | null>(auth.currentUser) // Keep track of user state

  // Function to initialize or get the economy document
  const initializeEconomyDoc = async (userId: string): Promise<DocumentReference> => {
    const economyDocRef = doc(db, 'users', userId, 'economy', 'current')
    try {
      const docSnap = await getDoc(economyDocRef);
      if (!docSnap.exists()) {
        console.log(`Economy document for user ${userId} not found. Creating with default values.`);
        await setDoc(economyDocRef, defaultEconomy);
        console.log(`Default economy document created for user ${userId}.`);
      } else {
         // Ensure vendasCompras exists if the doc exists but the field doesn't
         const currentData = docSnap.data() as EconomyData;
         if (currentData.vendasCompras === undefined || currentData.vendasCompras === null) {
            console.log(`vendasCompras field missing for user ${userId}. Initializing to 0.`);
            await setDoc(economyDocRef, { vendasCompras: 0 }, { merge: true });
         }
      }
    } catch (err) {
        console.error(`Error checking/creating economy document for user ${userId}:`, err);
        // Handle error appropriately, maybe re-throw or set an error state
        throw err; // Re-throw to indicate failure
    }
    return economyDocRef; // Return the reference
  }


  // Subscribe to economy data for the current user
  const subscribeToEconomy = async (userId: string) => {
    unsubscribe() // Unsubscribe from any previous listener
    isLoading.value = true
    error.value = null
    console.log(`Attempting to subscribe to economy data for user: ${userId}`)

    try {
        const economyDocRef = await initializeEconomyDoc(userId); // Ensure doc exists

        unsubscribeFromEconomy = onSnapshot(
          economyDocRef,
          (docSnap: DocumentSnapshot) => { // Add type for docSnap
            if (docSnap.exists()) {
              const data = docSnap.data() as EconomyData;
              // Ensure vendasCompras has a default value if missing
              economyData.value = {
                ...defaultEconomy, // Start with defaults
                ...data, // Override with Firestore data
                vendasCompras: data.vendasCompras ?? 0 // Explicitly default vendasCompras if null/undefined
              };
              console.log('Economy data updated:', economyData.value)
            } else {
              // This case should ideally be handled by initializeEconomyDoc,
              // but as a fallback, set to default.
              console.warn(`Economy document for user ${userId} unexpectedly missing after initialization attempt. Using default.`);
              economyData.value = { ...defaultEconomy };
            }
            isLoading.value = false;
          },
          (err: FirestoreError) => { // Add type for err
            console.error(`Error fetching economy data for user ${userId}:`, err);
            error.value = 'Failed to load economy data.';
            economyData.value = null // Clear data on error
            isLoading.value = false
          },
        )
        console.log(`Successfully subscribed to economy data for user: ${userId}`)
    } catch (initError) {
        console.error(`Failed to initialize economy document or subscribe for user ${userId}:`, initError);
        error.value = 'Failed to initialize economy data.';
        isLoading.value = false;
    }
  }

  // Unsubscribe function
  const unsubscribe = () => {
    if (unsubscribeFromEconomy) {
      console.log('Unsubscribing from economy data.')
      unsubscribeFromEconomy()
      unsubscribeFromEconomy = null
      // Optionally reset state when unsubscribing
      // economyData.value = null;
      // isLoading.value = true;
    }
  }

  // Watch for authentication changes
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed. New user:', user?.uid ?? 'null')
    currentUser.value = user
    if (user) {
      subscribeToEconomy(user.uid)
    } else {
      unsubscribe()
      economyData.value = null // Clear data on logout
      isLoading.value = true // Reset loading state
      error.value = null
    }
  })

  // Initial check in case user is already logged in when store initializes
  if (currentUser.value) {
    subscribeToEconomy(currentUser.value.uid)
  } else {
      isLoading.value = false // Not loading if no user initially
  }


  return {
    economyData,
    isLoading,
    error,
    subscribeToEconomy, // Expose if manual trigger needed elsewhere
    unsubscribe,
  }
})
