<template>
  <div class="economy-view">
    <h1>Economy</h1>
    <div v-if="isLoading" class="loading-message">Loading economy data...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="economyData">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lucros</td>
            <td>{{ formatCurrency(economyData.lucros) }}</td>
          </tr>
          <tr>
            <td>Despesas</td>
            <td>{{ formatCurrency(economyData.despesas) }}</td>
          </tr>
          <tr>
            <td>Publicidade</td>
            <td>{{ formatCurrency(economyData.publicidade) }}</td>
          </tr>
          <tr>
            <td>Vendas/Compras</td>
            <td>{{ formatCurrency(economyData.vendasCompras) }}</td>
          </tr>
          <tr>
            <td>Staff</td>
            <td>{{ formatCurrency(economyData.staff) }}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{{ formatCurrency(calculateTotal(economyData)) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="no-data-message">No economy data available.</div>
    <!-- Add economy related components and data here -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEconomyStore, type EconomyData } from '@/stores/economy'; // Adjust path if needed

const economyStore = useEconomyStore();

const isLoading = computed(() => economyStore.isLoading);
const error = computed(() => economyStore.error);
const economyData = computed(() => economyStore.economyData);

// Helper function to format currency
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return '$0.00'; // Or some other placeholder like '-'
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Helper function to calculate total (example calculation)
const calculateTotal = (data: EconomyData): number => {
  const lucros = data.lucros ?? 0;
  const despesas = data.despesas ?? 0;
  const publicidade = data.publicidade ?? 0;
  const vendasCompras = data.vendasCompras ?? 0; // Include vendas/compras in total
  const staff = data.staff ?? 0;

  // Example: Total = Lucros + Vendas/Compras - Despesas - Publicidade - Staff
  return lucros + vendasCompras - despesas - publicidade - staff;
};

// No need to explicitly call subscribe here, the store handles it based on auth state
</script>

<style scoped>
.economy-view {
  padding: 20px;
  color: #fff; /* Assuming a dark theme */
  background-color: #121212; /* Dark background */
  min-height: calc(100vh - 60px); /* Adjust based on header/footer height */
  animation: fadeIn 0.5s ease-in-out;
}

.loading-message, .error-message, .no-data-message {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2em;
}

.error-message {
  color: #ff6b6b; /* Red color for errors */
}

table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); /* Darker shadow */
  animation: slideIn 0.8s ease-out;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #333; /* Darker border */
}

td {
  color: #ccc; /* Lighter text for data */
}

th {
  background-color: #222; /* Darker header background */
  color: #646cff; /* Accent color for headers */
}

tr:hover {
  background-color: #1a1a1a; /* Darker hover effect */
}

tbody tr:last-child {
  font-weight: bold;
  background-color: #282828; /* Slightly different background for total row */
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  color: #646cff; /* Accent color */
  margin-bottom: 20px;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
