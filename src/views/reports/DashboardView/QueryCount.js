import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  colors,
  makeStyles
} from '@material-ui/core';
import { UserContext } from '../../../components/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.red[600],
    height: 56,
    width: 56
  },
  differenceIcon: {
    color: colors.red[900]
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1)
  }
}));

const QueryCount = ({ className, ...rest }) => {
  const classes = useStyles();
  let count = null;

  return (
    <UserContext.Consumer>
    {(context) => (
      <Card
        className={clsx(classes.root, className)}
        {...rest}
        ref={() => {
          count = context.countCellHour;
        }}
      >
        {
          count != null && (
        <CardContent>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
          > 
            <Grid item>
              <Typography color="textSecondary" gutterBottom variant="h6">
                QUERY COUNT
              </Typography>
              <Typography
                color="textPrimary"
                variant="h3"
              >
                {count.count}
              </Typography>
            </Grid>
          </Grid>
          <Box
            mt={2}
            display="flex"
            alignItems="center"
          >
            {/* <ArrowDownwardIcon className={classes.differenceIcon} /> */}
            <Typography
              className={classes.differenceValue}
              variant="body2"
            >
              {(count.diff/count.count).toFixed(2)}%
            </Typography>
            <Typography
              color="textSecondary"
              variant="caption"
            >
              Since last day
            </Typography>
          </Box>
        </CardContent>
        )}
      </Card>
    )}
    </UserContext.Consumer>
  );
};

QueryCount.propTypes = {
  className: PropTypes.string
};

export default QueryCount;
