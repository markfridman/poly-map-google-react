import React from 'react'

import hull from 'hull.js'
import {
  Map, GoogleApiWrapper, Polygon
} from 'google-maps-react';

import rawData from '../lib/rawdata'
import utils from '../lib/utils'
import consts from '../lib/consts'

const { getMinY, getMaxY, generateRange } = utils
const { gradient } = consts

const accumulatedCenter = rawData.reduce((acc, point) => {
  return { lng: acc.lng + point.lng, lat: acc.lat + point.lat }
}, { lng: null, lat: null })

const center = { lng: accumulatedCenter.lng / rawData.length, lat: accumulatedCenter.lat / rawData.length }

export class MapContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      points: [],
      topograpgicHeights: [],
    }
    this.createTopographicHeights = this.createTopographicHeights.bind(this)
    this.getPolygonPathByWeight = this.getPolygonPathByWeight.bind(this)
    this.map = React.createRef()
  }

  componentDidMount() {
    const arr = []
    const topoHeights = this.createTopographicHeights()
    topoHeights.forEach((topoHeight) => {
      arr.push(this.getPolygonPathByWeight(topoHeight))
    })
    this.setState({ points: arr })
  }

  createTopographicHeights = () => {
    const maxWeight = Math.round(getMaxY(rawData))
    const minWeight = Math.round(getMinY(rawData))
    const max = maxWeight + (10 - (maxWeight % 10))
    const min = minWeight - (minWeight % 10)
    const heights = generateRange(min, max, consts.HEIGHT_STEPS)
    return heights
  }

  getPolygonPathByWeight = (weight) => {
    const weightLevelPoints = rawData
      .filter(obj => (Math.round(obj.weight) < weight + 1.5 && Math.round(obj.weight) > weight - 1.5))

    const hullPoints = hull(weightLevelPoints.map((point) => [point.lat, point.lng]), 40)

    const points = hullPoints && hullPoints.map((point) => {
      return point && new this.props.google.maps.LatLng({ lat: point[0], lng: point[1] })
    })
    return points
  }

  render() {
    const { points } = this.state

    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <Map
          google={this.props.google}
          zoom={19}
          initialCenter={center}
          mapTypeControl
          mapTypeControlOptions={{ mapTypeIds: ['satellite', 'terrain'] }}
          
          ref={this.map}
        >
          {points.map((group, idx) => {
            return (
              <Polygon
                key={`p-${idx}`}
                path={group}
                options={{
                  fillColor: gradient[idx],
                  fillOpacity: 0.4,
                  strokeColor: "#000",
                  strokeOpacity: idx / 10,
                  strokeWeight: 1.5
                }}
              />
            )
          })}
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: ('<My Google Api Key>'),
  libraries: ['visualization']
})(MapContainer)