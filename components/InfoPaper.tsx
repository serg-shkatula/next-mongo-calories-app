import React from 'react';
import { Paper, Typography } from '@mui/material';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    p: 2,
    width: '100%',
    minHeight: 120,
  },
};

type Props = {
  title: string;
  infoText?: React.ReactNode;
  infoNumber?: number;
};

const InfoPaper: React.FC<Props> = ({ title, infoText, infoNumber }) => {
  return (
    <Paper sx={classes.root} elevation={12}>
      <Typography variant={'overline'}>{title}</Typography>
      <Typography sx={{ ml: 'auto', mt: 'auto' }}>
        {infoText}
        {infoNumber !== undefined && (
          <Typography component={'span'} fontSize={36}>
            {' '}
            {infoNumber.toLocaleString()}
          </Typography>
        )}
      </Typography>
    </Paper>
  );
};

export default InfoPaper;
