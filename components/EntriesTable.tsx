import React, { useCallback, useEffect, useState } from 'react';
import { MenuItem, Select, TextField } from '@mui/material';
import { Entry, User } from '../types';
import { DataGrid, GridColDef, GridEventListener, GridEvents } from '@mui/x-data-grid';
import moment from 'moment';
import { toDateTimePickerFormat } from '../functions/dateTimeFormatting';

const getColumns = (editable?: boolean, userColumn?: GridColDef) => {
  const result: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      editable,
      disableColumnMenu: !editable,
      sortable: editable,
      width: 200,
      renderCell: (p) => moment(p.value).format('Do MMM, HH:mm, YYYY'),
      renderEditCell: editable
        ? (p) => (
            <TextField
              sx={{ ml: 1, mr: 1 }}
              variant={'standard'}
              type="datetime-local"
              defaultValue={toDateTimePickerFormat(p.value as string)}
              InputProps={{
                sx: {
                  fontSize: 14,
                },
              }}
              onChange={(e) => {
                p.api.setEditCellValue({ id: p.id, field: p.field, value: new Date(e.target.value).toISOString() });
              }}
            />
          )
        : undefined,
    },
    {
      field: 'foodName',
      headerName: 'Food',
      editable,
      disableColumnMenu: !editable,
      sortable: editable,
      flex: 1,
    },
    {
      field: 'calories',
      headerName: 'Calories',
      align: 'right',
      type: 'number',
      headerAlign: 'right',
      editable,
      disableColumnMenu: !editable,
      sortable: editable,
    },
  ];

  if (userColumn) {
    result.push(userColumn);
  }

  return result;
};

type Props = {
  data: Entry[];
  editable?: boolean;
  users?: User[];
  onSelected?: (ids: string[]) => void;
  onChange?: (changes: Record<string, Record<string, unknown>>) => void;
};

type Edits = Record<string, Record<string, unknown>>;

const EntriesTable: React.FC<Props> = ({ data, editable, users, onSelected, onChange }) => {
  const [columns, setColumns] = useState<GridColDef[]>();
  const [edits, setEdits] = useState<Edits>({});

  const handleCellChange = useCallback<GridEventListener<GridEvents.cellEditCommit>>(
    (params) => {
      setEdits((es) => {
        const id = params.id.toString();
        const result: Edits = {
          ...es,
          [id]: {
            ...es[params.id as string],
            [params.field]: params.value,
          },
        };
        const originalEntry = data.find((item) => item.id === id);
        if (result[id][params.field] === originalEntry?.[params.field as keyof Entry]) {
          delete result[id][params.field];
        }
        if (!Object.keys(result[id]).length) {
          delete result[id];
        }
        return result;
      });
    },
    [data],
  );

  useEffect(() => {
    onChange?.(edits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edits]);

  useEffect(() => {
    let userColumn: GridColDef | undefined;
    if (users) {
      const usersById = users.reduce((res, u) => ((res[u.id] = u), res), {} as Record<string, User>);
      userColumn = {
        field: 'owner',
        headerName: 'User',
        align: 'right',
        headerAlign: 'right',
        editable: true,
        renderCell: (params) => usersById[params.value].name,
        renderEditCell: (params) => (
          <Select
            displayEmpty
            value={params.value}
            variant={'standard'}
            onChange={(e) => {
              params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
            }}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        ),
      };
    }
    setColumns(getColumns(editable, userColumn));
  }, [editable, users]);

  if (!columns) return null;

  return (
    <DataGrid
      classes={editable ? { virtualScroller: 'tableScrollContainer' } : undefined}
      rows={data}
      columns={columns}
      checkboxSelection={editable}
      disableSelectionOnClick
      sx={{ border: 0 }}
      hideFooter
      onCellEditCommit={editable ? handleCellChange : undefined}
      autoHeight={!editable}
      onSelectionModelChange={(selectionModel) => onSelected?.(selectionModel as string[])}
    />
  );
};

export default EntriesTable;
