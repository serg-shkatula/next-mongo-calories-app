import React, { useCallback } from 'react';
import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import mockedUsers from '../mocks/users';
import { User } from '../types';
import { useRouter } from 'next/router';
import { SxProps, Theme } from '@mui/material/styles';

const classes = {
  root: {
    backgroundColor: 'lightgray',
    pl: 1,
  },
};

type Props = { user?: User; sx?: SxProps<Theme> };

const MockUserSelection: React.FC<Props> = ({ sx = [], user }) => {
  const router = useRouter();

  //// Mocking user login based on selection ////
  const handleSelectChange = useCallback(
    (e) => {
      const selectedId = (e as SelectChangeEvent).target.value;
      const selectedUser = mockedUsers.find((u) => u.id === selectedId);
      fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ credentials: { password: selectedUser?.password } }),
      }).then(() => router.reload());
    },
    [router],
  );
  ///////////////////////////////////////////////

  return (
    <Box component={'div'} sx={[classes.root, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Select displayEmpty value={user?.id || ''} variant={'standard'} onChange={handleSelectChange}>
        <MenuItem key={'guest'} value={''}>
          Guest
        </MenuItem>
        {mockedUsers.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default MockUserSelection;
