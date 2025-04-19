import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Player { // Exported the interface
  id: string;
  name: string;
  position: string;
  number: number;
  rating: number;
  team: string; // Added team property
}

export const useTransfersStore = defineStore('transfers', () => {
  const playersForTransfer = ref<Player[]>([]);

  const addPlayerForTransfer = (player: Player) => {
    // Check if player is already in the list
    if (!playersForTransfer.value.some(p => p.id === player.id)) {
      playersForTransfer.value.push(player);
    }
  };

  const removePlayerFromTransfer = (playerId: string) => {
    playersForTransfer.value = playersForTransfer.value.filter(player => player.id !== playerId);
  };

  return {
    playersForTransfer,
    addPlayerForTransfer,
    removePlayerFromTransfer,
  };
});
