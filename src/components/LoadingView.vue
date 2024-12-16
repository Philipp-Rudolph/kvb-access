<template>
  <div class="loading-view">
    <div class="loading-view__content">
      <div class="loading-view__spinner"></div>
      <div class="loading-view__text">
        Loading...
        <p>Please stand by while I fetch the data 🙂‍↕️</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingView',
}
</script>

<style>
.loading-view {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #000000;
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.loading-view__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #000;
}

.loading-view__spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #000;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
