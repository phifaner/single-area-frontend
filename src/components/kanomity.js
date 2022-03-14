
// find adjacent voronoi cells given a screen point and # of buffered pixels
function findAdjacentCells(map, sp, n) {
    // set bbox as n px reactangle area around clicked point
    let bbox = [
      [sp.x - n, sp.y - n],
      [sp.x + n, sp.y + n]
    ];
  
    let features = map.queryRenderedFeatures(bbox, {
      layers: ['voronoi']
    });
  
    return features;
}

export function mapData(tracks, trackMap, trackCellMap, cellMap) {
    const gatherMap = new Map();
    const scatterMap = new Map();

    tracks.map((element) => {
        const firstCell = +element.points[0];
        const lastCell = +element.points[element.points.length-1];
        const count = +element.count;
        const points = element.points.map((e) => cellMap.get(+e)); // coordinates
        const path = element.points.map((e) => +e);     // cell id
        const j = { count, points };
        let v = [];
        if (trackMap.has(firstCell)) {
            v = trackMap.get(firstCell);
        }
        v.push(j);
        trackMap.set(firstCell, v);

        v = [];
        if (trackCellMap.has(firstCell)) {
            v = trackCellMap.get(firstCell);
        }
        v.push({count, path});
        trackCellMap.set(firstCell, v);

        // calculate gather for every cell, cell as Destination
        let gatherCount = count;
        if (gatherMap.has(lastCell)) {
            gatherCount += gatherMap.get(lastCell);
        }
        gatherMap.set(lastCell, gatherCount);

        // calculate scatter for every cell, cell as origin
        let scatterCount = count;
        if (firstCell == lastCell) scatterCount = 0;
        else if (scatterMap.has(firstCell)) {
            scatterCount += scatterMap.get(firstCell);
        }
        scatterMap.set(firstCell, scatterCount);
        return;
    });

    return {gatherMap, scatterMap}
}

export function doAnonymity(cell, tracks, k_anon, map, cellMap, gatherMap, scatterMap) {
    if (tracks === undefined || tracks.length === 0) return;
    let lossAmountAnonymity = 0;

    // show tracks, do not change the original tracks
    //   const newTracks = tracks.map(a => ({...a}));

    tracks.forEach( (elem, i, theArray) => {
        if (elem == undefined) return;
        // k anonymity
        if (elem.count > k_anon) return elem;

        lossAmountAnonymity += elem.count;
        // console.log(i + ", " + lossAmount);

        // if the length of path > 1, delete the last one
        while (elem.path.length > 2) {
            elem.path.pop();

            let idx = -1;
            // after removing the last point, add the count to a path with the same track
            tracks.forEach((e, k) => {
                if (e != undefined && e.path.length == elem.path.length) {
                    let path = e.path;
                    // TODO every points should have equal values
                    let cnt = 0;
                    path.forEach((p,j) => {
                        if (p != undefined && elem.path[j] != undefined 
                            && p === elem.path[j])
                        cnt ++;
                    })
                    if (cnt == path.length) return k;
                }
            })

            // if existing a path, add count to it
            if (idx != -1) {
                let node = tracks[idx];
                theArray[idx] = {count:node.count+elem.count, path:node.path};
                theArray[i] = undefined;
                return;
            }
        }
            
        let destination = elem.path[elem.path.length-1];
        if (destination == undefined) {
            theArray[i] = undefined;
            return;
        }

        // if the length == 1, add the count to an adjacent cell
        // with minimum loss
        let point = cellMap.get(destination);
        if (point === undefined) return;
        let screen_xy = map.project([point.lon, point.lat]);
        let neighbors = findAdjacentCells(map, screen_xy, 50);

        let lossMin = 1.0;
        let newDestination = 0;
        neighbors.forEach(element => {
            let coords = cellMap.get(element.id);
            if (coords == undefined) return;
            if (coords.lon == destination.lon 
                && coords.lat == destination.lat) return;

            let gather = gatherMap.get(element.id)+1;
            let scatter = scatterMap.get(element.id)+1;
            let loss = 1/gather+1/scatter;

            // find the cell with minimum loss
            if (loss < lossMin) {
                lossMin = loss;
                newDestination = element.id;
            }
        });

        // add count to the neighbor cell
        // console.log(newDestination);
        let found = tracks.findIndex(e => e != undefined && e.path.length == 2 
            && e.path[1] != undefined && e.path[1] === newDestination);
        if (found != -1) {
            // TODO update gatherMap and scatterMap, tracks
            let node = tracks[found];
            theArray[found] = {count:node.count+elem.count, path:node.path};
        }

        theArray[i] = undefined;
    });

    let pointTracks = [];
    tracks.forEach((elem) => {
        if (elem !== undefined) {
            elem.path.unshift(cell);       // add the current cell
            let points = [];
            elem.path.forEach((e) => {
                points.push(cellMap.get(e));
            })
            pointTracks.push({count: elem.count, points: points});
        }
    });

    return {tracks, pointTracks, lossAmountAnonymity};
}