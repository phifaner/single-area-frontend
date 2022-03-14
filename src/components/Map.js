import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as d3 from 'd3';
import {
  point, featureCollection, voronoi
} from '@turf/turf';
import {
  Paper
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { fetch as fetchPolyfill } from 'whatwg-fetch';
import { withStyles } from '@material-ui/styles';
import { UserContext } from './UserContext';

const useStyles = (theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '40%',
    height: '40vh',
    paddingBottom: '0px',
    paddingTop: '0px'
  }
});

const MAPBOX_TOKEN = 'pk.eyJ1IjoicGhpZmFuZXIiLCJhIjoiYzg0NGY4MDlhNjRlNzYwN2FlYTQwNWRiMzNmMzg5NjgifQ.2s5hwBusHP3st3t8pnEu7A';
mapboxgl.accessToken = MAPBOX_TOKEN;

// const SGSetting = {
//   latitude: 1.29,
//   longitude: 103.8519,
//   cellData: 'http://localhost:3000/data/sg_station.csv',
//   countData: 'http://localhost:3000/data/ezlink_count_2012-11-26.json'
// }

const WZSetting = {
  latitude: 28.01,
  longitude: 120.65,
  cellData: 'http://localhost:3000/data/bs_wz_full.csv',
  countData: 'http://localhost:3000/data/count_all_0201.json'
}

class MapPage extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.kvalue = props.kvalue;
    this.epsilon = props.epsilon;
    this.cellArray = [];
    this.state = {
      voronoiDraw: false,
      // wenzhou center
      latitude: WZSetting.latitude,
      longitude: WZSetting.longitude,
      // Singapore
      // latitude: SGSetting.latitude,
      // longitude: SGSetting.longitude,
      zoom: 14,
      bearing: 0,
      pitch: 0
    };
  }

  // load data and prepare for generating voronoi polygon
  componentDidMount() {
    // const context = UserContext;
    const mapBounds = [[120.5419, 27.904], [120.9817, 28.075]];
    // const mapBounds = [[103.0419, 1.164], [104.1817, 1.4685]];

    fetchPolyfill().then(async () => {
      const features = [];
      const cells = [];
      const cellMap = new Map();      // store cell: loc
     
      const data = await d3.csv(WZSetting.cellData);
      // Actually there is a bug in turf when generating voronoi diagram
      // if the center points is large enough (say 15000), fix it!
      data.forEach((element, i) => {
        if (element.lon !== '' && element.lat !== '') {
          const x = parseFloat(element.lon);
          const y = parseFloat(element.lat);
          cellMap.set(+element.cell, { lon: x, lat: y });
          if (x > mapBounds[0][0] && x < mapBounds[1][0]
            && y > mapBounds[0][1] && y < mapBounds[1][1] && i < 12000) {
            features.push(point([x, y]));
            cells.push(+element.cell);
          }
        }
      });

      const collection = featureCollection(features);
      const voronoiExtent = mapBounds[0].concat(mapBounds[1]);
      // const extent = bbox(collection);
      const options = {
        bbox: voronoiExtent
      };
      const voronoiPolygons = voronoi(collection, options);

      // Because turf.voronoi is returning null geometries, I create
      // another version of the voronoi geojson with the variable
      // and if statement directly below
      // const geojsonPolygon = {
      //   type: 'FeatureCollection',
      //   features: []
      // };
      // const geojsonArray = [];
      // voronoiPolygons.features.forEach((el, i) => {
      //   if (el != null) {
      //     const featurePush = {
      //       type: 'Feature',
      //       properties: collection.features[i].properties,
      //       geometry: el.geometry,
      //       cell: cells[i]
      //     };
      //     geojsonArray.push(featurePush);
      //   }
      // });
      // geojsonPolygon.features = geojsonArray;

      const geojsonPolygon = featureCollection(
        voronoiPolygons.features.filter((elem, i) => {
          if (elem != null) {
            elem.id = cells[i];
            elem.properties = { cell: cells[i] };
            return elem;
          }
          return null;
        })
      );

      const {
        longitude, latitude, zoom, bearing, pitch
      } = this.state;
      const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/light-v9',
        center: [longitude, latitude],
        zoom,
        bearing,
        pitch,
        attributionControl: false
      });

      map.on('load', () => {
        let { voronoiDraw } = this.state;
        map.addSource('center', {
          type: 'geojson',
          data: geojsonPolygon,
          generateId: false
        });
        if (voronoiDraw === false) {
          voronoiDraw = true;
          map.addLayer({
            id: 'voronoi',
            type: 'fill',
            source: 'center',
            layout: {},
            // paint: {
            //   'fill-color': 'rgba(0,0,0,0)',
            //   'fill-opacity': 1,
            //   'fill-outline-color': 'coral'
            // }
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'mouseover'], false],
                '#64bdbb', // if selected true, paint in blue
                'rgba(0,0,0,0)' // else paint in gray
              ],
              'fill-opacity': 0.4,
              'fill-outline-color': 'coral'
            },
            filter: ['==', '$type', 'Polygon']
          });
        } else {
          map.getSource('voronoi').setData(geojsonPolygon);
        }
      });

      let selected = true;
      map.on('click', 'voronoi', () => {
        // clear selected cells
        this.cellArray.forEach((cell) => {
          if (cell !== undefined || cell === null) {
              map.removeFeatureState({
                source: 'center',
                id: cell
              });
          }
        });
        this.cellArray = [];

        const { setCell, setMap, setCellMap } = this.context;
        setCellMap(cellMap);
        setMap(map);

        selected = false;

        map.on('mousemove', 'voronoi', (e) => {
          if (e.features[0].properties !== undefined && !selected) {
            const currentCell = e.features[0].properties.cell;
            if (this.cellArray.includes(currentCell)) return;

            this.cellArray.push(currentCell);
            map.getCanvas().style.cursor = 'pointer';
            if (e.features.length > 0) {
              const polygonID = e.features[0].properties.cell;
  
              map.setFeatureState({
                source: 'center',
                id: polygonID,
              }, {
                mouseover: true
              });
            }
          }
        });

        map.once('contextmenu', () => {
          selected = true;
          setCell(this.cellArray);
          console.log(this.cellArray);
        });
      });
    }).catch((err) => console.error(err));
  }

  render() {
    const { classes } = this.props;
    return (
      <UserContext.Consumer>
        {(context) => (
          <Paper variant="outlined" className={classes.root}>
            <div
              ref={(el) => {
                this.mapContainer = el;
                this.context = context;
              }}
              className={classes.root}
            />
          </Paper>
        )}
      </UserContext.Consumer>
    );
  }
}

MapPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(MapPage);
