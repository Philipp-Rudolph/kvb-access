<template>
  <div>
    <!-- Action Bar for Marker Details -->
    <div class="bar floating-action-bar" @click="$emit('close')">
      <h1 v-if="data.type.isStation">Haltestelle {{ data.properties.Name }}</h1>
      <h1 v-if="!data.type.isStation">{{ data.properties.Bezeichnung }}</h1>
      <h3 v-if="data.type.isStairs">Rolltreppe defekt</h3>
      <h3 v-if="data.type.isElevator">Aufzug defekt</h3>
      <h3 v-if="data.type.isStation">{{ data.properties.Name }}</h3>
      <p v-if="data.type.isStation">Hier fahren die Linien: {{ data.properties.Linien }}</p>
      <small><i>(klicken um zu schließen)</i></small>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: false,
    },
  },
}
</script>

<style scoped>
.bar {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin: 0 auto;
  min-width: 50vw;
  max-width: 80vw;
  border-radius: 2rem;
  border: 1px solid #fff;
  background: #000000c4;
  backdrop-filter: blur(20px);
  opacity: 0.8;
  transition: all 0.3s ease-out;
  color: white;
}

.floating-action-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;

  padding: 2.5rem;
}

.bar:hover {
  opacity: 1;
  transform: scale(1.05) translateY(-1.5rem) translateX(-50%);
}
</style>
