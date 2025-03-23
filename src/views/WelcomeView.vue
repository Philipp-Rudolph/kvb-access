<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <h1>Welcome to the KVB API</h1>
      <p>Click on a marker to see more information</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {}
</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2.5rem;
  height: 20vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #110101, #070023); /* Gradient background */
  color: #fff;
}

.welcome-content {
  text-align: center;
}
</style>
