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
.light-mode .search-bar__input>input {
  background-color: rgba(34, 34, 34, 0.95);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.light-mode .search-bar__results {
  background-color: rgba(34, 34, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.light-mode .search-bar__result {
  background-color: rgba(40, 40, 40, 0.95);
  color: white;
  border-left: 3px solid transparent;
}

.light-mode .search-bar__result:hover {
  background-color: rgba(50, 50, 50, 0.95);
  border-left: 3px solid #00bd7e;
}

/* Light Mode Styles */
.dark-mode .search-bar__input>input {
  background-color: rgba(255, 255, 255, 0.95);
  color: #222;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .search-bar__results {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.dark-mode .search-bar__result {
  background-color: rgba(245, 245, 245, 0.95);
  color: #222;
  border-left: 3px solid transparent;
}

.dark-mode .search-bar__result:hover {
  background-color: rgba(235, 235, 235, 0.95);
  border-left: 3px solid #00bd7e;
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

.light-mode .search-bar__input>input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.dark-mode .search-bar__input>input::placeholder {
  color: rgba(0, 0, 0, 0.4);
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

.dark-mode .search-bar__results::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.light-mode .search-bar__results::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
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
