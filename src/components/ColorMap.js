// import { legend } from "@d3/color-legend";
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as d3 from 'd3';
import { fetch as fetchPolyfill } from 'whatwg-fetch';
import { UserContext } from './UserContext';
import {mapData, doAnonymity} from './kanomity';

const fetch = require('d3-fetch');

const minValue = 700;
const maxValue = 13512;
const colors = ['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#005824'];
function colorFn(value) {
  let index = 0;
  if (value > 100 && value <= 300) index = 1;
  else if (value > 300 && value <= 500) index = 2;
  else if (value > 500 && value <= 700) index = 3;
  else if (value > 700 && value <= 1200) index = 4;
  else if (value > 1200 && value <= 1700) index = 5;
  else if (value > 1700) index = 6;
  return colors[index];
}

function drawLines(map, tracks) {
  const layers = map.getStyle().layers;
  layers.forEach((l) => {
    if (l.id.substr(0, 5) === 'route') {
      map.removeLayer(l.id);
      map.removeSource(l.id);
    }
  });

  tracks.forEach((elem, i) => {
    const myCoordinates = [];
    if (elem === undefined) return;
    elem.points.forEach((p) => {
      if (p !== undefined) myCoordinates.push([p.lon, p.lat]);
    });
    map.addSource(`route_${i}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: myCoordinates,
        },
      },
    });

    map.addLayer({
      id: `route_${i}`,
      type: 'line',
      source: `route_${i}`,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#888',
        'line-width': Math.log10(elem.count)
        // 'line-width': Math.log2(elem.count)
      }
    });
  });
}

const useStyles = (theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
    borderColor: 'grey.500',
    border: 1,
    padding: '0px'
  }
});

class ColorMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataIsReturned: false
    };
    this.myRef = React.createRef();
    this.minValue = 999;
    this.maxValue = 0;
    this.cellValues = null;
    this.cellId = 0;
    this.stateChanger = props.stateChanger;
  }

  componentDidMount() {
    // getCellCount();
    fetchPolyfill().then(async () => {
      const obj = await fetch.csv('http://localhost:3000/data/cell_hour.csv');
      const hourValues = obj.map((dv) => ({
        hour: Number(dv.hour),
        cell: Number(dv.cell),
        value: Number(dv.count)
      }));
      this.cellValues = d3.group(hourValues, (d) => {
        return d.cell;
      });

      this.setState({ dataIsReturned: true });
    }).catch((err) => console.error(err));
  }

  drawMap(cells) {
    const cellSize = 15;
    const dayHeight = cellSize * 4 + 5;
    const dayWidth = 128;
    const that = this;
    let countHourCurrent = 0;
    let countHourLast = 0;

    const cellId = cells[0];
    const hours = this.cellValues.get(cellId);
    if (hours === undefined || hours.length === 0) return;
    hours.sort((a, b) => a.hour - b.hour);
    d3.select(this.myRef)
      .selectAll('svg')
      .remove();
    const svg = d3.select(this.myRef)
      .append('svg')
      .attr('viewBox', [0, 0, dayWidth, dayHeight + cellSize * 3])
      .attr('font-family', 'sans-serif')
      .attr('font-size', 3);
    const hour = svg.append('g')
      .selectAll('rect')
      .data(hours)
      .join(
        (enter) => {
          return enter.append('rect');
        },
        (update) => {
          return update.attr('fill', (d) => {
            return colorFn(d.value);
          });
        }
      )
      .attr('width', cellSize - 1.5)
      .attr('height', cellSize - 1.5)
      .attr('x', (d) => {
        return (d.hour % 6) * cellSize + 10;
      })
      .attr('y', (d) => Math.floor(d.hour / 6) * cellSize + 0.5)
      .attr('fill', (d) => colorFn(d.value))
      .on('click', function(e, d) {
        // let time = new Date(d.hour * 1000);
        // let date = time.getDate();
        // let month = time.getMonth()+1;
        
        // TODO get data on the day
        const dataURL = 'http://localhost:3000/data/count_all_0201.json';
        
        fetchPolyfill().then(async () => {
          const _tracks = await d3.json(dataURL);
          
          const trackMap = new Map();     // all tracks (points) start from a cell (key)
          const trackCellMap = new Map(); // all tracks (cell number) start from a cell

          // cell is not a single but multiple cells
          const { cell, map, cellMap, setPrecision, setDprivacy, setKanomity } = that.context;

          // aggregate to gathering and scattering
          const {gatherMap, scatterMap} = mapData(_tracks, trackMap, trackCellMap, cellMap);

          let trackSet = [];
          let gatherAmount = 0.0;
          let scatterAmount = 0.0;
          let lossAmount = 0.0;

          const tempTracks = trackCellMap.get(cell[0]);
          if (tempTracks === undefined || tempTracks === null) return;

          // we need to change values of tracks, without changing the original tracks
          const mytracks = tempTracks.map(a => ({...a}));
          if (mytracks === undefined || mytracks.length === 0) return;

          // do anonymity, do not change the original tracks
          const {tracks, pointTracks, lossAmountAnonymity} 
            = doAnonymity(cell[0], mytracks, that.context.kvalue, map, cellMap, gatherMap, scatterMap);
          trackSet.push(tracks);
          drawLines(map, pointTracks);

          // calculate # people of gather, scatter, as well as loss of gather scatter
          gatherAmount += gatherMap.get(cell[0]);
          scatterAmount += scatterMap.get(cell[0]);
          lossAmount += lossAmountAnonymity;

          const cellValueDay = that.cellValues.get(cellId);

          countHourCurrent += cellValueDay[d.hour].value;
          countHourLast += cellValueDay[d.hour-1].value;

          // differential privacy, here we just set original tracks while process in the backend
          setDprivacy(tempTracks);

          // console.log(this.context.kvalue);

          // show Sankey Diagrams
          setKanomity(trackSet);

          // K-Anonymity loss
          setPrecision({gather: gatherAmount, scatter: scatterAmount, 
            fresh: true, kanonymityLoss: lossAmount/(gatherAmount+scatterAmount)});
          // show sankey diagram: compare.js
          that.stateChanger(true);
          that.context.setRefresh(true);
          that.context.setCountCellHour({hour: d.hour, count: countHourCurrent, diff: countHourCurrent-countHourLast});
        });
      });


    svg.select('g')
      .append('text')
      .attr('x', -10)
      .attr('y', 5)
      .attr('text-anchor', 'end')
      .attr('font-size', 8)
      .attr('transform', 'rotate(270)')
      .text(17668);

    // display legennd
    const legend = svg.append('g')
      .attr('transform', `translate(10, ${dayHeight + cellSize})`);
    const categoriesCount = 10;
    const legendWidth = 15;

    const categories = [...Array(categoriesCount)].map((_, i) => {
      const upperBound = (maxValue / categoriesCount) * (i + 1);
      const lowerBound = (maxValue / categoriesCount) * i;

      return {
        upperBound,
        lowerBound,
        color: d3.interpolateBuGn(upperBound / maxValue)
      };
    });

    function toggle(leg) {
      const { lowerBound, upperBound, selected } = leg;
      leg.selected = !selected;

      hour.attr('fill', (d) => {
        const f = d.value > lowerBound && d.value <= upperBound;
        return leg.selected && f ? colorFn(d.value) : 'white';
      });
    }

    legend
      .selectAll('rect')
      .data(categories)
      .enter()
      .append('rect')
      .attr('fill', (d) => d.color)
      .attr('x', (d, i) => legendWidth * i)
      .attr('width', legendWidth)
      .attr('height', 8)
      .on('click', (e, d) => {
        toggle(d);
      });

    // legend
    //   .selectAll('text')
    //   .data(categories)
    //   .join('text')
    //   .attr('transform', 'rotate(90)')
    //   .attr('y', (d, i) => -legendWidth * i)
    //   .attr('dy', -30)
    //   .attr('x', 18)
    //   .attr('text-anchor', 'start')
    //   .attr('font-size', 4)
    //   .text((d) => `${d.lowerBound.toFixed(2)} - ${d.upperBound.toFixed(2)}`);

    legend
      .append('text')
      .attr('dy', -5)
      .attr('font-size', 6)
      // .attr('text-decoration', 'underline')
      .text('Category');
  }

  render() {
    const { dataIsReturned } = this.state;
    const { classes } = this.props;
    if (!dataIsReturned) return <h1>Loading</h1>;
    return (
      <UserContext.Consumer>
        {(context) => (
          <Paper variant="outlined" className={classes.root}>
            <Typography id="discrete-slider">
              Hourly Pattern
            </Typography>
            <div
              className={classes.root}
              ref={(el) => {
                this.myRef = el;
                this.context = context;
                const { cell } = this.context;
                if (cell !== '0') this.drawMap(cell);
              }}
            />
          </Paper>
        )}
      </UserContext.Consumer>
    );
  }
}

ColorMap.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(ColorMap);
