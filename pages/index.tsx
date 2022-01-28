import React from 'react';
import { Box, Button } from '@mui/material';
import { GetServerSideProps } from 'next/types';
import { getUserFromRequest, sanitiseDbUser } from '../functions';
import { User } from '../types';
import AppFrame from '../components/AppFrame';

const classes = {
  content: {
    p: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  buttonContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

type Props = {
  user?: User;
};

const Home: React.FC<Props> = ({ user }) => {
  return (
    <AppFrame title={'Calories App'} description={'Calories App Home Page'} user={user} contentSx={classes.content}>
      {user && (
        <Box component={'div'} sx={classes.buttonContainer}>
          <Button variant={'contained'} href={'/app'}>
            Go to app
          </Button>
        </Box>
      )}
    </AppFrame>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const user = await getUserFromRequest(context.req);
  if (!user) return { props: {} };

  if (user.role === 'admin') {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: sanitiseDbUser(user),
    },
  };
};

export default Home;
