import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { toDatePickerFormat } from '../functions/dateTimeFormatting';

const classes = {
  root: {
    display: 'flex',
    alignItems: 'center',
    p: 2,
    '&>*:not(:last-child)': {
      mr: 1,
    },
  },
};

export const defaultDateFilterState = { left: '', right: '' };

type Props = {
  onChange: (state: typeof defaultDateFilterState) => void;
};

const DateFilter: React.FC<Props> = ({ onChange }) => {
  const [state, setState] = useState(defaultDateFilterState);

  useEffect(() => {
    if (state !== defaultDateFilterState) onChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Box sx={classes.root}>
      <Typography component={'span'}>Filter from</Typography>
      <TextField
        size={'small'}
        type={'date'}
        inputProps={{ max: state.right || toDatePickerFormat() }}
        onChange={(e) => setState((s) => ({ ...s, left: e.target.value }))}
      />
      <Typography component={'span'}>to</Typography>
      <TextField
        size={'small'}
        type={'date'}
        inputProps={{ max: toDatePickerFormat(), min: state.left }}
        onChange={(e) => setState((s) => ({ ...s, right: e.target.value }))}
      />
    </Box>
  );
};

export default DateFilter;
