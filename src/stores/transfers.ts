import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
  writeBatch,
  increment, // Import increment
} from 'firebase/firestore' // Import Firestore functions
import { db, auth } from '../firebaseConfig' // Import db instance and auth
import { getAuth } from 'firebase/auth' // Import getAuth

export interface Player {
  id: string // Firestore document ID for the item *on the transfer list*
  originalId?: string // The player's original, persistent ID from the 'players' collection
  sellerUserId?: string // The UID of the user selling the player
  name: string
  position: string
  number: number
  rating: number
  team: string // Team name (selling team)
  price?: number // Add optional price field
  // Add any other properties needed for the transfer list display
}

export const useTransfersStore = defineStore('transfers', () => {
  const playersForTransfer = ref<Player[]>([])
  const isSubscribed = ref(false) // Flag to prevent multiple subscriptions
  let unsubscribeFromTransferList: (() => void) | null = null // To store the unsubscribe function

  // Subscribe to real-time updates from the transfer list collection
  const subscribeToTransferList = () => {
    if (isSubscribed.value) {
      console.log('Already subscribed to transfer list.')
      return
    }

    console.log('Subscribing to transfer list...')
    const transferListCollectionRef = collection(db, 'transferList')
    const q = query(transferListCollectionRef)

    unsubscribeFromTransferList = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPlayers: Player[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          console.log(
            `[subscribeToTransferList] Raw data from Firestore for doc ${doc.id}:`,
            JSON.stringify(data),
          ) // Log raw Firestore data
          // Map Firestore data to Player interface
          const player: Player = {
            id: doc.id, // Use Firestore doc ID as the ID for the item *on the transfer list*
            originalId: data.originalId, // Fetch the original player ID
            sellerUserId: data.sellerUserId, // Fetch the seller's user ID
            name: data.name,
            position: data.position,
            number: data.number,
            rating: data.rating,
            team: data.team,
            price: data.price, // Read the price from Firestore
            // Map other properties as needed
          }
          // Ensure originalId and sellerUserId are present
          if (!player.originalId || !player.sellerUserId) {
            console.error(
              `Player data missing originalId or sellerUserId in transferList: ${doc.id}`,
              data,
            )
            return // Skip this player if critical IDs are missing (use return in forEach)
          }
          fetchedPlayers.push(player)
        })
        playersForTransfer.value = fetchedPlayers
        console.log('Transfer list updated:', fetchedPlayers.length, 'players')
      },
      (error) => {
        console.error('Error fetching transfer list:', error)
        // Handle error (e.g., show a message to the user)
      },
    )

    isSubscribed.value = true
  }

  // Unsubscribe from real-time updates
  const unsubscribe = () => {
    if (unsubscribeFromTransferList) {
      unsubscribeFromTransferList()
      unsubscribeFromTransferList = null
      isSubscribed.value = false
      console.log('Unsubscribed from transfer list.')
    }
  }

  // Add a player to the transfer list in Firestore
  const addPlayerForTransfer = async (player: Player) => {
    console.log('[addPlayerForTransfer] Received player data:', JSON.stringify(player)) // Log received player data

    // Primeira verificação: validação do preço
    if (player.price === undefined || player.price === null) {
      console.error('Price is missing or invalid:', player.price)
      throw new Error('Player price must be set before adding to transfer list')
    }

    // Segunda verificação: autenticação do usuário (separada da primeira)
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      console.error('Error adding player to transfer: User not logged in.')
      throw new Error('User not authenticated')
    }
    const sellerUserId = currentUser.uid

    try {
      // Check if player is already listed to avoid duplicates in Firestore
      const transferListCollectionRef = collection(db, 'transferList')
      // Query by the player's *original* ID to see if they are already listed
      const q = query(transferListCollectionRef, where('originalId', '==', player.id))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Player not already on the list, add to Firestore
        const dataToSave = {
          // Explicitly list properties to ensure 'id' from player object isn't included
          originalId: player.id, // Store the original ID (which was the player's doc ID)
          sellerUserId: sellerUserId, // Store the seller's user ID
          name: player.name,
          position: player.position,
          number: player.number,
          rating: player.rating,
          team: player.team, // Selling team's name
          price: player.price, // Explicitly include price
        }
        console.log(
          '[addPlayerForTransfer] Data being saved to Firestore:',
          JSON.stringify(dataToSave),
        ) // Log data before saving
        // Store the player's original ID and the seller's user ID explicitly
        await addDoc(transferListCollectionRef, dataToSave)
        console.log(
          'Player added to transfer list. Original ID:',
          player.id,
          'Seller ID:',
          sellerUserId,
          'Price:',
          dataToSave.price,
        ) // Log the price that was saved
      } else {
        console.log('Player already on transfer list (Original ID):', player.id)
      }
    } catch (error) {
      console.error('Error adding player to transfer list:', error)
      // Handle error
    }
  }

  // Remove a player from the transfer list in Firestore
  const removePlayerFromTransfer = async (transferListItemId: string) => {
    // Use the Firestore doc ID
    try {
      // Find the document in Firestore by its transfer list item ID
      const transferListItemRef = doc(db, 'transferList', transferListItemId)
      await deleteDoc(transferListItemRef)
      console.log('Player removed from transfer list in Firestore:', transferListItemId)
    } catch (error) {
      console.error('Error removing player from transfer list:', error)
      // Handle error
    }
  }

  // Buy a player from the transfer list
  const buyPlayer = async (player: Player, buyingTeamName: string) => {
    // Ensure we have the necessary IDs and price before proceeding
    if (!player.originalId || !player.sellerUserId || player.price === undefined || player.price === null) {
      console.error('Cannot buy player: Missing originalId, sellerUserId, or price.', player)
      throw new Error('Player data is incomplete (missing originalId, sellerUserId, or price).')
    }

    const currentUser = getAuth().currentUser
    if (!currentUser) {
      console.error('Error buying player: User not logged in.')
      throw new Error('User not authenticated')
    }
    const buyerUserId = currentUser.uid
    const sellerUserId = player.sellerUserId
    const playerOriginalId = player.originalId
    const transferListItemId = player.id
    const salePrice = player.price // Store price for clarity

    // Prevent buying own player (although UI should handle this)
    if (buyerUserId === sellerUserId) {
      console.warn('Attempted to buy own player.')
      throw new Error('You cannot buy your own player.')
    }

    try {
      // 1. Get the reference to the player doc in the SELLER's subcollection
      const sellerPlayerDocRef = doc(db, 'users', sellerUserId, 'players', playerOriginalId)

      // Optional: Fetch player data if needed for validation or logging, but not strictly required for move
      const playerSnap = await getDoc(sellerPlayerDocRef)
      if (!playerSnap.exists()) {
        console.error(
          "Player document not found in seller's collection:",
          sellerUserId,
          playerOriginalId,
        )
        // Attempt to remove from transfer list anyway, as it might be orphaned data
        await deleteDoc(doc(db, 'transferList', transferListItemId))
        throw new Error(`Original player document not found in seller's collection.`)
      }
      const playerDataToMove = playerSnap.data() // Get data before deleting

      // 2. Remove the player from the transferList collection
      const transferListItemRef = doc(db, 'transferList', transferListItemId)
      await deleteDoc(transferListItemRef)
      console.log('Player removed from transfer list:', transferListItemId)

      // 3. Delete the player document from the SELLER's subcollection
      await deleteDoc(sellerPlayerDocRef)
      console.log('Player document deleted from seller:', sellerUserId, playerOriginalId)

      // 4. Add the player document to the BUYER's subcollection
      const buyerPlayerDocRef = doc(db, 'users', buyerUserId, 'players', playerOriginalId)
      // Update the team name within the player data before adding it
      const updatedPlayerData = { ...playerDataToMove, team: buyingTeamName }
      await setDoc(buyerPlayerDocRef, updatedPlayerData)
      console.log(
        'Player document added to buyer:',
        buyerUserId,
        playerOriginalId,
        'with team:',
        buyingTeamName,
      )

      // --- Update Both Economies ---
      const batch = writeBatch(db);

      // Set up seller update
      const sellerEconomyRef = doc(db, 'users', sellerUserId, 'economy', 'current');
      // First get current economy data for seller
      const sellerEconomySnap = await getDoc(sellerEconomyRef);
      const sellerCurrentVendasCompras = (sellerEconomySnap.data()?.vendasCompras || 0);
      // Update seller's economy
      batch.set(sellerEconomyRef, {
        vendasCompras: sellerCurrentVendasCompras + salePrice
      }, { merge: true });

      // Set up buyer update
      const buyerEconomyRef = doc(db, 'users', buyerUserId, 'economy', 'current');
      // First get current economy data for buyer
      const buyerEconomySnap = await getDoc(buyerEconomyRef);
      const buyerCurrentVendasCompras = (buyerEconomySnap.data()?.vendasCompras || 0);
      // Update buyer's economy
      batch.set(buyerEconomyRef, {
        vendasCompras: buyerCurrentVendasCompras - salePrice
      }, { merge: true });

      // Commit both updates atomically
      await batch.commit();
      console.log(`Transfer completed successfully:
        Seller (${sellerUserId}) vendasCompras increased by ${salePrice}
        Buyer (${buyerUserId}) vendasCompras decreased by ${salePrice}`);

    } catch (error) {
      console.error('Error during player transfer process:', error)
      // Consider more robust error handling/rollback if needed
      throw error // Re-throw the error
    }
  }

  return {
    playersForTransfer,
    addPlayerForTransfer,
    removePlayerFromTransfer,
    buyPlayer, // Export the new action
    subscribeToTransferList,
    unsubscribe, // Export unsubscribe
  }
})
