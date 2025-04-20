import L from 'leaflet'

const setupMap = {
  map: null,
  markerClusterGroup: null,
  darkMode: true,

  /**
   * Initialisiert die Karte mit den angegebenen Parametern
   * @param {HTMLElement} containerId - Das DOM-Element, in dem die Karte gerendert wird
   * @param {L.MarkerClusterGroup} markerCluster - MarkerClusterGroup für gruppierte Marker
   * @param {Array} initialCoordinates - Initiale Koordinaten [Lat, Lng]
   * @param {int} zoomLevel - Initiales Zoom-Level
   * @param {boolean} darkMode - Aktiviert/Deaktiviert den Dark Mode
   * @returns {L.Map} Die initialisierte Karte
   */
  init(
    containerId,
    markerCluster,
    initialCoordinates = [50.9413, 6.9583],
    zoomLevel = 13,
    darkMode = true,
  ) {
    this.darkMode = darkMode

    // Stelle sicher, dass der Container eine Höhe hat
    if (containerId && typeof containerId === 'object' && containerId.style) {
      if (!containerId.style.height) {
        console.warn('Der Karten-Container hat keine Höhe. Setze auf 100vh.')
        containerId.style.height = '100vh'
      }
    }

    try {
      // Initialisiere die Karte mit smoothen Zoom-Optionen
      this.map = L.map(containerId, {
        zoomSnap: 0.5, // Zoom kann in 0.1er-Schritten erfolgen statt ganzzahlig
        zoomDelta: 0.5, // Mausrad-Zoom ändert sich in 0.5er-Schritten
        wheelDebounceTime: 40, // Debounce für glatteren Zoom
        wheelPxPerZoomLevel: 60, // Wie viele Pixel Scrolling für eine Zoom-Änderung nötig sind
        fadeAnimation: true, // Aktiviere Fade-Animationen
        zoomAnimation: true, // Aktiviere Zoom-Animationen
        inertia: true, // Aktiviere Trägheitseffekt beim Ziehen
        inertiaDeceleration: 3000, // Langsamere Abbremsung für glatteren Effekt
        maxZoom: 20, // Maximaler Zoom-Level
        minZoom: 2, // Minimaler Zoom-Level
      })

      if (this.tileLayer && this.map) {
        this.map.removeLayer(this.tileLayer)
      }

      const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

      this.tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      })

      if (this.map) {
        this.tileLayer.addTo(this.map)
      }

      // Setze initiale Position mit Animation
      this.map.setView(initialCoordinates, zoomLevel)

      // MarkerCluster hinzufügen
      this.markerClusterGroup = markerCluster
      if (this.markerClusterGroup) {
        this.map.addLayer(this.markerClusterGroup)
      }

      // Trigger eines resize-Events nach kurzer Verzögerung
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
        }
      }, 100)

      return this.map
    } catch (error) {
      console.error('Fehler bei der Karteninitialisierung:', error)
      throw error
    }
  },
  /**
   *
   * @param {string} iconUrl
   * @returns
   */
  createIcon(iconUrl) {
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [50, 50],
      iconAnchor: [15, 50],
      popupAnchor: [0, -50],
      className: 'icon',
    })
  },

  /**
   *
   * @param {*} data
   * @param {*} icon
   * @param {*} type
   * @param {*} onClickCallback
   * @returns
   */
  async addMarkers(data, icon, type, onClickCallback) {
    const markers = data.map((item) => {
      // Create the marker instance in one go
      const marker = L.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
        icon,
        title: item.properties.Bezeichnung || item.properties.Name,
        Haltestellenbereich: item.properties.Haltestellenbereich,
        type,
      }).addTo(this.map)

      // Add custom class to marker for stations with disorders
      L.DomUtil.addClass(marker._icon, `${type}-marker`)
      if (item.hasDisorder || type === 'stairs' || type === 'elevator') {
        L.DomUtil.addClass(marker._icon, 'disorder')
        L.DomUtil.removeClass(marker._icon, 'no-disorder')
        // add unique id to marker
        marker._icon.id = item.properties.Kennung
      } else {
        L.DomUtil.addClass(marker._icon, 'no-disorder')
        L.DomUtil.addClass(marker._icon, 'station-marker')
        L.DomUtil.removeClass(marker._icon, 'disorder')
      }

      // Add click event to marker
      marker.on('click', () => {
        if (onClickCallback) {
          onClickCallback(item)
        }
        this.map.flyTo([item.geometry.coordinates[1], item.geometry.coordinates[0]], 16, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.2,
        })

        // this.map.setView([item.geometry.coordinates[1], item.geometry.coordinates[0]], 16)
        console.log(marker)
      })

      // Add popup to marker
      if (type === 'station') {
        marker.bindPopup(`<b>${item.stationInfo.Haltestellenname}</b>`, {
          permanent: true,
          direction: 'top',
        })
        marker._icon.id = item.stationInfo.Haltestellenbereich
      }

      marker.on('mouseover', () => {
        marker.openPopup()
      })

      marker.on('mouseout', () => {
        marker.closePopup()
      })

      return marker
    })

    // this.map.addLayer(this.markerClusterGroup)
    return markers
  },

  /**
   * Zoomt sanft zu einer bestimmten Position
   * @param {Array} coordinates - Zielkoordinaten [Lat, Lng]
   * @param {number} zoomLevel - Zielniveau des Zooms
   * @param {Object} options - Optionen für die Animation
   */
  smoothZoomTo(coordinates, zoomLevel, options = {}) {
    if (!this.map) return

    const defaultOptions = {
      animate: true,
      duration: 1.5, // 1.5 Sekunden für die Animation
      easeLinearity: 0.25, // Sanftere, nicht-lineare Animation
    }

    this.map.flyTo(coordinates, zoomLevel, { ...defaultOptions, ...options })
  },
  /**
   *
   * @param {*} marker
   */
  hightlightMarker(marker) {
    const type = marker.L.DomUtil.addClass(marker._icon, `${type}-marker`)
  },
}

export default setupMap
