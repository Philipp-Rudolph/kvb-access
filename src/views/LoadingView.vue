<template>
  <div>
    <div class="loading-container">
      <div class="loading" v-if="!error"></div>
      <div class="loading-spinner">
        <div class="loading-spinner-inner"></div>
      </div>
      <p>{{ msg || 'Lade Daten ... ' }}</p>
      <!-- <p v-else>
        {{ error.msg }}
        <br />
        <button @click="$emit('retry')">Retry</button>
      </p> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingView',
  data() {
    return {}
  },
  props: {
    error: {
      type: [Object, Boolean], default: false
    },
    msg: {
      type: String, default: 'Wird geladen...'
    },
  },
  computed: {},
  methods: {},
  mounted() { },
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2.5rem;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #110101, #070023);
  /* Gradient background */
  color: #fff;
}

.loading {
  width: 125px;
  height: 125px;
  border: 5px solid rgba(243, 243, 243, 0.1);
  border-top: 5px solid #34dbc8;
  border-radius: 50%;
  animation: spin 2s ease-out infinite;
}

/* Make the text more exciting with some animations */
p {
  color: #b9b9b9;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  /* Text glow */
  animation: fadeIn 2s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    border-top: 5px solid #34dbc8;
  }

  50% {
    transform: rotate(180deg);
    border-top: 5px solid #ff7e67;
  }

  100% {
    transform: rotate(360deg);
    border-top: 5px solid #34dbc8;
  }
}

/* Add bounce effect to the spinner */
@keyframes bounce {

  0%,
  100% {
    transform: rotate(360deg) translateY(0);
  }

  50% {
    transform: rotate(360deg) translateY(-15px);
  }
}

/* Fade in/out effect for the text */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
