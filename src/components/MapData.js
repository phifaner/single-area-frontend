import * as d3 from 'd3';
import turf from '@turf/turf';
// import { fetch as fetchPolyfill } from 'whatwg-fetch';

export default async function loadData() {
  const features = [];
  const cells = [];
  const cellMap = new Map(); // store cell: loc
  const trackMap = new Map(); // all tracks included in a cell
  let i = 0;
  let options = {};
  let ttcVoronoi = [];
  // fetchPolyfill().then(async () => {
  const data = await d3.csv('http://localhost:3000/data/bs_wz_full.csv');
  data.forEach((element) => {
    i++;
    if (element.lon !== '' && element.lat !== '') {
      const x = parseFloat(element.lon);
      const y = parseFloat(element.lat);
      cellMap.set(+element.cell, { lon: x, lat: y });
      if (x > 120.5419 && x < 120.9817 && y > 27.904 && y < 28.075 && i < 8000) {
        features.push(turf.point([x, y]));
        cells.push(+element.cell);
      }
    }
  });

  ttcVoronoi = turf.featureCollection(features);
  const extent = turf.bbox(ttcVoronoi);

  options = {
    bbox: extent
  };

  const _tracks = await d3.json('http://localhost:3000/data/count_all_0201.json');
  _tracks.map((element) => {
    const firstCell = +element.points[0];
    const count = +element.count;
    const points = element.points.map((e) => cellMap.get(+e));
    const j = { count, points };
    let v = [];
    if (trackMap.has(firstCell)) {
      v = trackMap.get(firstCell);
    }
    v.push(j);
    trackMap.set(firstCell, v);
    return trackMap;
  });

  const voronoiPolygons = turf.voronoi(ttcVoronoi, options);
  return [voronoiPolygons, trackMap, cells];
}
