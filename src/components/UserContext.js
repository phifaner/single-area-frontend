import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext();
// This context provider is passed to any component requiring the context
export const UserProvider = ({ children }) => {
  const [cell, setCell] = useState('0');
  const [cellMap, setCellMap] = useState();
  const [map, setMap] = useState();
  const [kanomity, setKanomity] = useState();
  const [dprivacy, setDprivacy] = useState();
  const [precision, setPrecision] = useState('');
  const [utility, setUtility] = useState('');
  const [kvalue, setKvalue] = useState();
  const [epsilon, setEpsilon] = useState();
  const [countCellHour, setCountCellHour] = useState();
  const [refresh, setRefresh] = useState();

  return (
    <UserContext.Provider
      value={{
        cell, setCell,          // choose voronoi cell
        cellMap, setCellMap,    // set cell id and its coordinates
        map, setMap,            // mapbox
        kanomity, setKanomity,  // send kanomity to visualize sankey
        dprivacy, setDprivacy,  // set dprivacy for backend computation
        precision, setPrecision,// send k anonymity utility to show bie chart
        utility, setUtility,    // send differential privacy utility to show bie chart
        kvalue, setKvalue,      // parameters for privacy setting
        epsilon, setEpsilon,
        countCellHour, setCountCellHour, // {hour, count, diff to the last hour} 
        refresh, setRefresh    
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.any
};
