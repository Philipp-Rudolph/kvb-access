<template>
  <div>
    <div class="search-bar" :class="{ 'dark-mode': darkMode, 'light-mode': !darkMode }">
      <div class="search-bar__input">
        <input type="text" v-model="search" @keyup.enter="seachStation" placeholder="Nach Haltstelle suchen" />
      </div>
      <div v-if="search.length > 0" class="search-bar__results-container">
        <div class="search-bar__results">
          <div class="search-bar__result" v-for="station in filteredStations(search)"
            :key="station.item.stationInfo.Haltestellenname" @click="selectStation(station)">
            {{ station.item.stationInfo.Haltestellenname }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: false,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      search: '',
    }
  },
  methods: {
    filteredStations(searchValue) {
      const lowercaseSearch = searchValue.toLowerCase()
      // Assign a score to each station based on how closely it matches the search value
      return this.data
        .map((station) => {
          const stationName = station.item.stationInfo.Haltestellenname.toLowerCase()
          let score = 0
          if (stationName.startsWith(lowercaseSearch)) {
            // Higher score for exact prefix matches
            score = 3
          } else if (stationName.includes(lowercaseSearch)) {
            // Lower score for substring matches
            score = 2
          }
          return { station, score }
        })
        .filter((entry) => entry.score > 0) // Only include stations with a match
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.station.item.stationInfo.Haltestellenname.localeCompare(
              b.station.item.stationInfo.Haltestellenname,
            ),
        ) // Sort by score, then alphabetically
        .map((entry) => entry.station) // Return only the station objects
    },
    selectStation(station) {
      this.$emit('selectStation', station)
      this.search = ''
    },
  },
}
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;
  max-width: 500px;
  min-width: 300px;
  padding: 0 20px;
  transition: all 0.3s ease;
}

.search-bar__input {
  width: 100%;
}

.search-bar__results-container {
  background-color: transparent;
  padding: 10px 0;
  border-radius: 10px;
  margin-top: 5px;
}

/* Dark Mode Styles */
.search-bar__input>input {
  background-color: var(--button-background);
  color: var(--text-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--button-background);
}

.search-bar__results {
  background-color: var(--background-color);
  border: 1px solid var(--button-background);
  box-shadow: 0 8px 24px var(--button-background);
}

.search-bar__result {
  background-color: var(--background-color-darker);
  color: var(--text-color);
  border-left: 3px solid transparent;
}

.search-bar__result:hover {
  background-color: var(--background-color-darker);
  border-left: 3px solid var(--highlight-color);
}

/* Common Styles */
.search-bar__input>input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 8px;
  outline: none;
  text-align: center;
  transition: all 0.3s ease;
}

.search-bar__input>input:focus {
  transform: translateY(-2px);
}

.search-bar__input>input:focus::placeholder {
  color: transparent;
}

.search-bar__input>input::placeholder {
  color: var(--gray-color);
}

.search-bar__results {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 6px;
  max-height: 50vh;
  overflow: auto;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-bar__result {
  width: 100%;
  padding: 12px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-weight: 500;
}

.search-bar__result:hover {
  transform: translateX(3px);
}

/* Scrollbar Styles */
.search-bar__results::-webkit-scrollbar {
  width: 6px;
}

.search-bar__results::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 768px) {
  .search-bar {
    max-width: 90%;
  }
}
</style>
