<template>
  <div class="economy-view">
    <h1>Economy</h1>
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
          <td>$150,000</td>
        </tr>
        <tr>
          <td>Despesas</td>
          <td>$80,000</td>
        </tr>
        <tr>
          <td>Publicidade</td>
          <td>$10,000</td>
        </tr>
        <tr>
          <td>Vendas/Compras</td>
          <td>$30,000</td>
        </tr>
        <tr>
          <td>Staff</td>
          <td>$40,000</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>$10,000</strong></td>
        </tr>
      </tbody>
    </table>
    <!-- Add economy related components and data here -->
  </div>
</template>

<script setup lang="ts">
// Add any necessary script setup logic here
</script>

<style scoped>
.economy-view {
  padding: 20px;
  color: #fff; /* Assuming a dark theme */
  background-color: #121212; /* Dark background */
  min-height: calc(100vh - 60px); /* Adjust based on header/footer height */
  animation: fadeIn 0.5s ease-in-out;
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
