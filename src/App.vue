<script setup>
import MapView from './components/MapView.vue'
document.body.style.height = "200vh"; // Make the page temporarily tall
window.scrollTo(0, 1);
setTimeout(() => {
  document.body.style.height = "100vh"; // Restore height
}, 100);
</script>

<template>
  <main>
    <MapView />
  </main>
</template>

<style>
main {
  height: 100dvh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}
</style>
