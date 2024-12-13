import L from 'leaflet'
import 'leaflet.markercluster'

const setupMap = {
  map: null,
  markerClusterGroup: null,

  init(containerId, initialCoordinates = [50.9413, 6.9583], zoomLevel = 13) {
    this.map = L.map(containerId).setView(initialCoordinates, zoomLevel)
    // this.markerClusterGroup = L.markerClusterGroup()

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map)

    return this.map
  },

  createIcon(iconUrl) {
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [50, 50],
      iconAnchor: [15, 50],
      popupAnchor: [0, -50],
      className: 'icon',
    })
  },

  // createMarkers(data, icon, type, clickHandler) {
  //   return data.map((item) => {
  //     const marker = L.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
  //       icon,
  //       className: `${type}-marker`,
  //     })
  //     marker.on('click', () => clickHandler(item))
  //     return marker
  //   })
  // },

  async addMarkers(data, icon, type, onClickCallback) {
    const markers = data.map((item) => {
      const marker = L.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
        icon,
        title: item.properties.Bezeichnung || item.properties.Name,
        Haltestellenbereich: item.properties.Haltestellenbereich,
        type,
      }).addTo(this.map)

      L.DomUtil.addClass(marker._icon, `${type}-marker`)

      marker.on('click', () => {
        console.log('clicked', marker)
        if (onClickCallback) {
          onClickCallback(item)
        }
      })

      // this.markerClusterGroup.addLayer(marker)
      return marker
    })

    // this.map.addLayer(this.markerClusterGroup)
    return markers
  },

  async toggleMarkersVisibility(map, markers, isVisible) {
    const markersData = await markers
    markersData.forEach((marker) => {
      if (isVisible) {
        if (!map.hasLayer(marker)) marker.addTo(map)
      } else {
        if (map.hasLayer(marker)) marker.removeFrom(map)
      }
    })
  },
}

export default setupMap
