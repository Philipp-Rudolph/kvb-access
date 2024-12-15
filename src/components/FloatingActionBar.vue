<template>
  <div>
    <!-- Action Bar for Marker Details -->
    <div class="bar floating-action-bar" @click="$emit('close')">
      <!-- Header Section -->
      <h1 v-if="data.type.isStation">
        Haltestelle {{ replaceAllSpecialChars(data.properties.Name) }}
      </h1>
      <h1 v-else-if="data.type.isStairs">Rolltreppe defekt</h1>
      <h1 v-else-if="data.type.isElevator">Aufzug defekt</h1>

      <!-- Details Section -->
      <template v-if="!data.type.isStation">
        <h3>{{ replaceAllSpecialChars(data.properties.Bezeichnung) }}</h3>
        <p>zuletzt aktualisiert: {{ formatDate(data.properties.timestamp) }}</p>
      </template>

      <!-- Description Section -->
      <template v-else>
        <h3>{{ replaceAllSpecialChars(data.properties.Name) }}</h3>
        <p v-if="data.hasDisorder" class="description">
          An dieser Haltestelle gibt es Störungen an Rolltreppen und / oder Aufzügen. Klicken Sie
          auf die Haltestelle um mehr Informationen zu erhalten
        </p>
        <p>Hier fahren die Linien: {{ data.properties.Linien.replaceAll(' ', ', ') }}</p>
      </template>
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
  mounted() {
    console.log(this.fixEncoding('Haltestelle Ã¶ffnet Ã¼bermorgen'))
    // Expected output: "Haltestelle öffnet übermorgen"
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('de-DE')
    },
    // function to fix special chars (ß, ä, ö, ü) in the Linien property
    replaceAllSpecialChars(str) {
      if (!str) return ''
      return str
        .replaceAll('Ã¼', 'ü')
        .replaceAll('Ã¶', 'ö')
        .replaceAll('Ã¤', 'ä')
        .replaceAll('ÃŸ', 'ß')
    },
    fixEncoding(str) {
      if (!str) return ''

      // Decode Latin-1 misinterpreted as UTF-8
      return decodeURIComponent(escape(str))
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

.description {
  font-size: 0.9rem;
  text-align: justify;
  width: 100%;
  opacity: 0.9;
}
</style>
