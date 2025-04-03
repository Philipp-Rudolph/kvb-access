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
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
    })
    tileLayer.addTo(this.map)

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
   *
   * @param {*} marker
   */
  hightlightMarker(marker) {
    const type = marker.L.DomUtil.addClass(marker._icon, `${type}-marker`)
  },
}

export default setupMap
