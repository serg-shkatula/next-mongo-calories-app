import React from 'react';
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { User } from '../types';
import Head from 'next/head';
import MockUserSelection from './MockUserSelection';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    p: 1,
  },
  main: {
    flex: 1,
  },
  footer: {
    p: 1,
    backgroundColor: 'black',
    color: 'white',
  },
  appWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
};

type Props = { user?: User; title: string; description: string; sx?: SxProps<Theme>; contentSx?: SxProps<Theme> };

const AppFrame: React.FC<Props> = ({ sx = [], contentSx = [], user, title, description, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component={'div'} sx={[classes.root, ...(Array.isArray(sx) ? sx : [sx])]}>
        <MockUserSelection user={user} />
        <Box component={'div'} sx={classes.appWrapper}>
          <Box component={'header'} sx={classes.header}>
            <Typography>Calories App</Typography>
          </Box>
          <Box component={'main'} sx={[classes.main, ...(Array.isArray(contentSx) ? contentSx : [contentSx])]}>
            {children}
          </Box>
          <Box component={'footer'} sx={classes.footer}>
            <Typography variant={'caption'}>Copyright</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AppFrame;
