import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { Entry, User } from '../types';
import { toDateTimePickerFormat } from '../functions/dateTimeFormatting';

const classes = {
  root: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255, 0.75)',
  },
  paper: {
    p: 2,
  },
  buttonsContainer: {
    display: 'flex',
    m: -1,
    mt: 0,
    mb: 0,
    '&>button': {
      m: 1,
      '&:first-of-type': {
        ml: 'auto',
      },
    },
  },
  fieldsContainer: {
    m: -1,
    mt: 2,
    mb: 1,
    '&>div': {
      margin: 1,
    },
  },
};

type NewEntry = Omit<Entry, 'id' | 'owner'> & { owner?: string };
type Field = {
  id: keyof NewEntry;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  sx?: Record<string, unknown>;
};

type Props = {
  onAction: (type: 'cancel' | 'create', data?: NewEntry) => void;
  users?: User[];
};

const defaultDateTimeValue = toDateTimePickerFormat();
const fields: Field[] = [
  { id: 'date', type: 'datetime-local', defaultValue: defaultDateTimeValue },
  { id: 'foodName', placeholder: 'Food name' },
  { id: 'calories', type: 'number', placeholder: 'Calories', sx: { maxWidth: 120 } },
];

const ownerField: Field = { id: 'owner', type: 'select', placeholder: 'Owner' };
const extendedFields = [...fields, ownerField];

const NewEntryPopover: React.FC<Props> = ({ onAction, users }) => {
  const [data, setData] = useState<NewEntry | Partial<NewEntry>>({ date: defaultDateTimeValue });
  const fieldsRef = useRef<Field[]>(users ? extendedFields : fields);

  const handleChange = useCallback((fieldId: string, value?: unknown) => {
    setData((d) => ({ ...d, [fieldId]: typeof value === 'string' ? value.trim() : value }));
  }, []);

  const handleCancelClick = useCallback(() => onAction('cancel'), [onAction]);
  const handleCreateClick = useCallback(() => {
    if (data.date && data.foodName && data.calories) {
      onAction('create', data as NewEntry);
    }
  }, [data, onAction]);

  useEffect(() => {
    fieldsRef.current = users ? extendedFields : fields;
  }, [users]);

  const isComplete = fieldsRef.current.every((f) => !!data[f.id]?.toString());

  return (
    <Box sx={classes.root}>
      <Paper sx={classes.paper} elevation={12}>
        <Typography variant={'h6'}>New Entry</Typography>
        <Box sx={classes.fieldsContainer}>
          {fieldsRef.current.map((f) =>
            f.type === 'select' ? (
              <Select key={f.id} defaultValue={' '} size={'small'} onChange={(e) => handleChange(f.id, e.target.value)}>
                <MenuItem disabled value=" ">
                  <em>{f.placeholder}</em>
                </MenuItem>
                {users?.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <TextField
                key={f.id}
                defaultValue={f.defaultValue}
                inputProps={{ min: 0, max: toDateTimePickerFormat() }}
                size={'small'}
                {...f}
                onChange={(e) => handleChange(f.id, e.target.value)}
              />
            ),
          )}
        </Box>
        <Box sx={classes.buttonsContainer}>
          <Button variant={'contained'} color={'inherit'} onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button variant={'contained'} disabled={!isComplete} onClick={handleCreateClick}>
            Create
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewEntryPopover;
