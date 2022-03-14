import React from 'react';
import {
  Container,
  Box,
  makeStyles,
  Paper
} from '@material-ui/core';
// import Page from 'src/components/Page';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { UserContext } from './UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(3),
    borderColor: 'grey.500',
    border: 1,
    padding: '0px'
  },
  container: {
    padding: '0px'
  }
}));

const ParamSetting = () => {
  const classes = useStyles();
  // const handleChange = props.paramsChanger;
  let ctx = {};

  const handleKValueChange = (event, newValue) => {
    ctx.setKvalue(newValue);
  }

  const handleEpsilonChange = (event, newValue) => {
    ctx.setEpsilon(newValue);
  }

  return (
    <UserContext.Consumer>
      {(context) => (
        <Paper 
          ref={() => {
            ctx = context;
          }}
          variant="outlined" className={classes.root}>
          <Typography id="discrete-slider">
            Parameter Setting
          </Typography>
          <Container maxWidth="lg">
            <Box mt={3}>
              <Typography id="discrete-slider">
                k-anonymity
              </Typography>
              <Slider
                defaultValue={30}
                // getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={10}
                max={50}
                onChange = {handleKValueChange}
              />
            </Box>
            <Box mt={3}>
              <Typography component="h5" id="discrete-slider">
                Epsilon Budget
              </Typography>
              <Slider
                defaultValue={0.1}
                // getAriaValueText={valuetext}
                // getAriaLabel={"epsilon"}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.05}
                marks
                min={0.01}
                max={2.0}
                onChange={handleEpsilonChange}
              />
            </Box>
          </Container>
        </Paper>
      )}
    </UserContext.Consumer>
  );
};

export default ParamSetting;
