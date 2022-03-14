import React, {useState} from 'react';
import {
  Container,
  Grid,
  makeStyles,
  Divider
} from '@material-ui/core';
import MapPage from 'src/components/Map';
import ParamSetting from 'src/components/Parameter';
import ColorMap from 'src/components/ColorMap';
import Page from 'src/components/Page';
import CompareView from 'src/components/Compare';
import Utility from 'src/components/Utility';
import { UserProvider } from 'src/components/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    padding: '1px',
    // paddingBottom: theme.spacing(3)
    paddingTop: theme.spacing(3)
  },
  container: {
    [theme.breakpoints.up('lg')]: {
      width: 256
    }
  }
}));

const MainFrame = () => {
  const classes = useStyles();
  const [state, setState] = useState('');  // if show sankey diagram
  // const [kvalue, setKvalue] = useState('');
  // const [epsilon, setEpsilon] = useState('');

  // const handleChange = (event, newValue) => {
  //   console.log(newValue);
  //   // if (newValue > 1) setKvalue(newValue);
  //   // else setEpsilon(newValue);
  // }

  return (
    <Page
      className={classes.root}
      title="MainFrame"
    >
      <UserProvider>
        <Container maxWidth={false}>
          <Grid
            container
            spacing={1}
          >
            <Grid item xs={2}>
              <Grid container spacing={1} direction="column">
                <Grid item xs={12}>
                  <ParamSetting />
                </Grid>
                <Divider />
                <Grid item xs={12}>
                  <ColorMap stateChanger={setState}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={8}>
              <MapPage  /> 
              <Divider />
              { <CompareView />}
            </Grid>
            <Grid item xs={2}>
              { state && (<Utility />) }
            </Grid>
          </Grid>
        </Container>
      </UserProvider>
    </Page>
  );
};

export default MainFrame;
