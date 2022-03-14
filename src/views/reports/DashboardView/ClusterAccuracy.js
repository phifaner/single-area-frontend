// import React, { useEffect } from 'react';
// import ReactDOM from 'react-dom';
import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
// import { Doughnut } from 'react-chartjs-2';
import {
  // Box,
  Card,
  // CardContent,
  CardHeader,
  Divider,
  // Typography,
  colors,
  // useTheme,
  makeStyles
} from '@material-ui/core';
import { UserContext } from '../../../components/UserContext';

const d3 = require('d3');

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.green[600],
    height: 56,
    width: 56
  },
  differenceIcon: {
    color: colors.green[900]
  },
  differenceValue: {
    color: colors.green[900],
    marginRight: theme.spacing(1)
  }
}));

const ClusterAccuracy = ({className, ...rest }) => {
  const classes = useStyles();

  var color = d3.scaleOrdinal()
      .range(["#5A39AC", "#DD98D6", "#E7C820"]);

  const doughnut = (ref, precision, utility) => {
    const width = 100;
    const height = 60;
    const radius = Math.min(width, height) / 2;
    const donutWidth = 20;
    var legendRectSize = 40;
    var legendSpacing = 20;

    const sum = precision.gather+precision.scatter;
    const totals = [{
        title: "gather",
        value: precision.gather,
        all: sum
      },
      {
        title: "scatter",
        value: precision.scatter,
        all: sum
      },
      {
        title: "stay",
        value: precision.gather-precision.scatter,
        all: sum
      } 
    ];

    const legendData = [
      {
        title: 'GATHER',
        value: precision.gather,
        // icon: LaptopMacIcon,
        position: [-5, legendSpacing]
      },
      {
        title: 'SCATTER',
        value: precision.scatter,
        position: [legendRectSize + 2*legendSpacing-5, legendSpacing]
      },
      {
        title: 'KA Loss',
        value: precision.kanonymityLoss == undefined ? 0 : precision.kanonymityLoss.toFixed(4),
        // icon: PhoneIcon,
        // position: [legendRectSize * 2 + legendSpacing * 2 - 5, legendRectSize]
        position: [-5, 3 * legendSpacing]
      },
      {
        title: 'DP Loss',
        value: utility === null || utility === undefined || utility === '' ? 0 : utility.toFixed(4),
        // icon: PhoneIcon,
        position: [legendRectSize + 2*legendSpacing-5, 3 * legendSpacing]
      }
    ];

    // remove existing diagrams
    d3.select(ref)
      .selectAll('svg')
      .remove();

    const svg = d3.select(ref).append('svg')
      .attr('viewBox', [-10, 0, width+20, height])
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);
    var pie = d3.pie()
        .value(function (d) {
              return d.value;
        })
        .sort(null);
    svg.selectAll('path')
        .data(pie(totals))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) {
              return color(d.data.title);
        })
        .transition().duration(500)
        .attr('transform', 'translate(0, 0)');

    // add legend
    const legend = d3.select(ref).append('svg')
      .attr('viewBox', [-10, 0, width+40, 2*legendRectSize])
      // .attr('transform', 'translate(' + 0 + ',' + (legendRectSize) + ')');

    var place = legend.selectAll('.legend') //the legend and placement
    .data(legendData)
    .enter()
    .append('g');
    
    place.append('text')
    .attr('x', (d) => d.position[0])
    .attr('y', (d) => d.position[1])
    .style("font-size", "11px")
    .style('font-weight', 600)
    .style('fill', (d) => color(d.title))
    .text(function (d) {
        return d.title;
    });

    place.append('text')
    .attr('x', (d) => d.position[0])
    .attr('y', (d) => d.position[1] + legendSpacing - 6)
    .style("font-size", "10px")
    .style('font-weight', 600)
    .text(function (d) {
        return d.value;
    });
  };
  
  return (
    <Card className={clsx(classes.root, className)} {...rest}>
    <CardHeader title="CLUSTER ACCURACY" titleTypographyProps={{ variant: 'h5' }} />
    <Divider />
    <UserContext.Consumer>
    {(context) => (
      <div
        className={classes.root}
        ref={(el) => {
          // precision: k anonymity, utility: differential privacy
          const { precision,  utility } = context;
          if ( precision === undefined || precision === '' ) return <h1>Loading</h1>;
          if (precision.fresh && utility != null) {
            doughnut(el, precision, utility)
            precision.fresh = false;
          }

        }}>
        </div>
    )}
    </UserContext.Consumer>
    </Card>
  );

};

ClusterAccuracy.propTypes = {
  className: PropTypes.string
};

export default ClusterAccuracy;
