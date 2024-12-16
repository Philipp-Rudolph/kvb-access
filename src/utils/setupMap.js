import L from 'leaflet'

const setupMap = {
  map: null,
  markerClusterGroup: null,

  /**
   *
   * @param {*} containerId
   * @param {*} initialCoordinates
   * @param {int} zoomLevel
   * @returns
   */
  init(containerId, markerCluster, initialCoordinates = [50.9413, 6.9583], zoomLevel = 13) {
    this.map = L.map(containerId).setView(initialCoordinates, zoomLevel)
    this.markerClusterGroup = markerCluster

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map)
    // this.map.addLayer(this.markerClusterGroup)

    return this.map
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
      const marker = L.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]], {
        icon,
        title: item.properties.Bezeichnung || item.properties.Name,
        Haltestellenbereich: item.properties.Haltestellenbereich,
        type,
      }).addTo(this.map)

      L.DomUtil.addClass(marker._icon, `${type}-marker`)
      if (item.hasDisorder || type === 'stairs' || type === 'elevator') {
        L.DomUtil.addClass(marker._icon, 'disorder')
        L.DomUtil.removeClass(marker._icon, 'no-disorder')
      } else {
        L.DomUtil.addClass(marker._icon, 'no-disorder')
        L.DomUtil.removeClass(marker._icon, 'disorder')
      }

      marker.on('click', () => {
        if (onClickCallback) {
          onClickCallback(item)
        }
        this.map.setView([item.geometry.coordinates[1], item.geometry.coordinates[0]], 18)
        console.log(marker)
      })

      if (type === 'station') {
        marker.bindPopup(`<b>${item.stationInfo.Haltestellenname}</b>`, {
          permanent: true,
          direction: 'top',
        })
      }

      // if (type !== 'station') {
      //   this.markerClusterGroup.addLayer(marker)
      // }

      return marker
    })

    // this.map.addLayer(this.markerClusterGroup)
    return markers
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
