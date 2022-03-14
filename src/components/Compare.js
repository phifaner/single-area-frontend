import { React, useEffect, useState } from 'react';
// import { fetch as fetchPolyfill } from 'whatwg-fetch';
import {
  Paper,
  makeStyles,
  Typography
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
import {sankey, sankeyLinkHorizontal} from 'd3-sankey';
import { UserContext } from './UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(4),
    minHeight: '20%',
    height: '20vh',
  },
  paper: {
    height: 220,
    width: 450,
  },
  node: {
    "&:hover": {
      cursor: 'pointer',
    },
    "&:text": {
      fill: '#888888',
      stroke: 'none'
    }
  },
  link: {
    stroke: '#cccccc',
    strokeOpacity: .4,
    fill: 'none',
    "&:hover": {
      strokeOpacity: .6,
      cursor: 'pointer'
    }
  }
}));

const d3 = require("d3");

let anonymityRef = null, dprivacyRef = null;
let mytracks = null;
let privateTracks = null;
let doUtility = null;
let dpLoss = null;

const width = 600;
const height = 294;
const colors = (d) => {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[d.name % colores_g.length];
};

// Checks if link creates a cycle
function createsCycle (originalSource, nodeToCheck, graph) {
  if (graph.length === 0) {
    return false
  }

  var nextLinks = findLinksOutward(nodeToCheck, graph)
  // leaf node check
  if (nextLinks.length === 0) {
    return false
  }

  // cycle check
  for (var i = 0; i < nextLinks.length; i++) {
    var nextLink = nextLinks[i]

    if (nextLink.target === originalSource) {
      return true
    }

    // Recurse
    if (createsCycle(originalSource, nextLink.target, graph)) {
      return true
    }
  }

  // Exhausted all links
  return false
}

/* Given a node, find all links for which this is a source
   in the current 'known' graph  */
function findLinksOutward (node, graph) {
  var children = []

  for (var i = 0; i < graph.length; i++) {
    if (node === graph[i].source) {
      children.push(graph[i])
    }
  }

  return children
}

// Identify circles in the link objects
function identifyCircles (graph) {
  var addedLinks = []
  var circularLinkID = 0
  graph.links.forEach(function (link) {
    if (createsCycle(link.source, link.target, addedLinks)) {
      link.circular = true
      link.circularLinkID = circularLinkID
      circularLinkID = circularLinkID + 1
    } else {
      link.circular = false
      addedLinks.push(link)
    }
  })
}

const draw = (agg, ref) => {
  // remove existing diagrams
  d3.select(ref)
  .selectAll('svg')
  .remove();
  if (agg === undefined) return;

  let nodesData = [];
  let linksData = [];



  agg.forEach(elem => {
    if (elem === undefined) return;

    const {count, path} = elem;
    if (count === undefined || path === undefined) return;

    let last = path[0];
    let found = nodesData.find((e) => e.name === last);
    if (found === undefined) nodesData.push({ name: last });

    path.map((p, i) => {
      if (i > 0) {
        if (last !== p) {
          // check if exists a link
          found = linksData.find((e) => e.source === last && e.target === p);
          if (found) {
            found.value += count;
            last = p;
            return;
          }
          // check if exist a loop link
          found = linksData.find((e) => e.source === p && e.target === last);
          if (found) {
            found.value += count;
            last = p;
            return;
          }
          nodesData.push({ name: p });
          linksData.push({ source: last, target: p, value: count });
        }  
      }
      last = p;
    });
  });

  if (nodesData.length === 0 || linksData.length === 0) return;

  const graph = {
    nodes: nodesData.map(d => Object.assign({}, d)),
    links: linksData.map(d => Object.assign({}, d))
  };
  identifyCircles(graph);
  const linkNoCircular = graph.links.filter((link) => !link.circular);

  const {nodes, links} = mySankey({nodes: graph.nodes, links: linkNoCircular});

  const svg = d3.select(ref).append('svg')
    .attr('viewBox', [-10, 0, width, height])
    // .attr("transform", "translate(" + 0 + "," + 10 + ")");
  
  svg.append("g")
    .attr("stroke", "#000")
  .selectAll("rect")
  .data(nodes)
  .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", colors)
    .attr("class", "node")
  .append("title")
    .text(d => `${d.name}\n${d.value}`);
  
  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .join("g")
    .attr("class", "link")
    .style("mix-blend-mode", "multiply");
    
  const gradient = link.append('linearGradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', (d) => d.source.x1)
    .attr('x2', (d) => d.target.x0);

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', (d) => colors(d.source));

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', (d) => colors(d.target));
  
  link.append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", (d) =>  colors(d.source) )
    .attr("stroke-width", (d) => Math.max(1, d.width));

  link.append('title')
    .text((d) => `${d.source.name} → ${d.target.name}\n${d.value}`);
  
  svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
  .selectAll("text")
  .data(nodes)
  .join("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d => d.name);
};

const mySankey = sankey()
    .nodeId(d => d.name)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 5], [width - 1, height - 5]]);

const CompareView =  () => {
  const target = 'ws://localhost:8080/privacy/dpwebsocket/echoAnnotation';
  const classes = useStyles();
  const [ws, setWs] = useState(new WebSocket(target));

  const send = (message, callback) => {
    waitForConnection(function () {
        ws.send(message);
        if (typeof callback !== 'undefined') {
          callback();
        }
    }, 1000);
  };

  const waitForConnection = (callback, interval) => {
    if (ws.readyState === 1) {
        callback();
    } else {
        // optional: implement backoff for interval here
        setTimeout(function () {
            waitForConnection(callback, interval);
        }, interval);
    }
  };

  // WebSocket
  useEffect( () => {
    ws.onopen = function () {
      console.log('Info: WebSocket connection opened.');
    };
  
    ws.onmessage = function (event) {
      console.log('Received: ' + event.data);
      const data = JSON.parse(event.data);
        privateTracks = data.privacy;
        dpLoss = data.utility;
          // const status = response.status;
        // console.log(privateTracks);
        // set Differential Privacy loss
        if (doUtility !== null) doUtility(dpLoss);
  
        if (privateTracks !== null && privateTracks !== undefined) 
          draw(privateTracks, dprivacyRef);
    };
  
    return () => {
      ws.onclose = function (event) {
        console.log('Info: WebSocket connection closed, Code: ' + event.code + (event.reason === "" ? "" : ", Reason: " + event.reason));
        setWs(new WebSocket(target));
      };
    }

  }, [ws.onmessage, ws.onopen, ws.onclose]);


  // Similar to componentDidMount and componentDidUpdate:
  const doPrivacy = (mytracks, epsilon) => {
    if (mytracks === null) return;

    // echo(JSON.stringify(mytracks));
    const session = JSON.stringify({'tracks': mytracks, 'epsilon': epsilon});
    send(session, () => {});
  };

  return (
    <UserContext.Consumer>
      {(context) => (
          <Grid item xs={12}>
          <Grid container className={classes.root} justifyContent="center" spacing={2}>
              <Grid key={0} item>
                <Typography
                color="textSecondary"
                gutterBottom
                variant="h6"
              >
                K-ANONYMITY
              </Typography>
                <Paper className={classes.paper} ref={(el) => {
                    anonymityRef = el;
                    const { kanomity } = context;

                    if (kanomity !== undefined && kanomity !== null)
                      draw(kanomity[0], anonymityRef);
                    
                  }} />
              </Grid>
              <Grid key={1} item>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="h6"
                >
                  DIFFERENTIAL PRIVACY
                </Typography>
                <Paper className={classes.paper} ref={(el) => {
                    dprivacyRef = el;
                    const { dprivacy, setUtility, epsilon} = context;
                    mytracks = dprivacy;
                    doUtility = setUtility;

                    if (context.refresh !== undefined && context.refresh) {
                      doPrivacy(mytracks, epsilon);
                      context.setRefresh(false);
                    }
                }} />
              </Grid>
          </Grid>
        </Grid>
      )}
    </UserContext.Consumer>
  );
};

export default CompareView;
