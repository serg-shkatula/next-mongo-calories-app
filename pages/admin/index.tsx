import React, { ComponentProps, useCallback, useEffect, useState } from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';
import { useRouter } from 'next/router';
import database from '../../utils/database';
import { DbEntry, DbUser, Entry, User } from '../../types';
import { getUserFromRequest, replaceId, sanitiseDbUser } from '../../functions';
import EntriesTable from '../../components/EntriesTable';
import AppFrame from '../../components/AppFrame';
import { Box, Fab, Icon, Paper } from '@mui/material';
import InfoPaper from '../../components/InfoPaper';
import { SxProps, Theme } from '@mui/material/styles';
import moment from 'moment';
import NewEntryPopover from '../../components/NewEntryPopover';
import { entriesApiCall } from '../../utils/api';

const classes = {
  content: {
    p: 1,
    display: 'flex',
  },
  leftContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 220,
    width: '20%',
    ml: 1,
    mr: 1,
    '&>*': {
      mb: 2,
    },
  } as SxProps<Theme>,
  rightContainer: {
    position: 'relative',
    flex: 1,
    margin: 1,
    mt: 0,
    p: 2,
  },
  fabButtonsContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 2,
  },
};

type Stats = {
  newEntriesThisWeek: number;
  newEntriesLastWeek: number;
  averageCaloriesPerDay7Days: number;
};

type Props = {
  user?: User;
  users: User[];
  entries: Entry[];
  stats: Stats;
};

type Changes = Record<string, Record<string, unknown>>;

const Admin: React.FC<Props> = ({ user, users, entries, stats }) => {
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  const [resetKey, setResetKey] = useState(false);
  const [changes, setChanges] = useState<Changes>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>();
  const router = useRouter();
  useEffect(() => {
    if (!user) router?.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleNewEntryPopoverAction = useCallback<ComponentProps<typeof NewEntryPopover>['onAction']>(
    (type, data) => {
      if (type === 'cancel') return setIsAddingNewEntry(false);
      if (!data) return;
      setIsFetching(true);
      entriesApiCall('POST', {
        data: {
          ...data,
          date: new Date(data.date).toISOString(),
          calories: Number(data.calories || 0),
        },
      }).then(() => router.reload());
    },
    [router],
  );
  const handleAddClick = useCallback(() => setIsAddingNewEntry(true), []);

  const handleDeleteClick = useCallback(() => {
    if (!confirm('Are you sure?')) return;
    setIsFetching(true);
    entriesApiCall('DELETE', {
      ids: selectedIds,
    }).then(() => router.reload());
  }, [router, selectedIds]);

  const handleSelection = useCallback((ids: string[]) => setSelectedIds(ids), []);
  const handleChange = useCallback((changes: Changes) => setChanges(changes), [setChanges]);

  const handleCancel = useCallback(() => setResetKey((k) => !k), [setResetKey]);
  const handleSave = useCallback(() => {
    setIsFetching(true);
    entriesApiCall('PUT', {
      changes,
    }).then(() => router.reload());
  }, [changes, router]);

  if (!user) return null;

  return (
    <AppFrame
      title={'Admin Panel'}
      description={'Calories App Admin Panel'}
      user={user}
      sx={isFetching ? { opacity: 0.35, pointerEvents: 'none' } : {}}
      contentSx={classes.content}
    >
      <Box component={'div'} minWidth={400} sx={classes.leftContainer}>
        <InfoPaper title={'Last 7 days'} infoText={'new entries:'} infoNumber={stats.newEntriesThisWeek} />
        <InfoPaper title={'Prior week'} infoText={'new entries:'} infoNumber={stats.newEntriesLastWeek} />
        <InfoPaper title={'7 day avg.'} infoText={'cal pp:'} infoNumber={stats.averageCaloriesPerDay7Days} />
      </Box>
      <Paper sx={classes.rightContainer} elevation={12}>
        {entries && (
          <EntriesTable
            key={resetKey.toString()}
            data={entries}
            editable={true}
            users={users}
            onSelected={handleSelection}
            onChange={handleChange}
          />
        )}
        <Box sx={classes.fabButtonsContainer}>
          {!!selectedIds.length ? (
            <Fab variant="extended" onClick={handleDeleteClick}>
              Delete
              <Icon sx={{ ml: 1 }}>delete</Icon>
            </Fab>
          ) : !!Object.keys(changes).length ? (
            <>
              <Fab variant="extended" onClick={handleCancel}>
                Cancel
                <Icon sx={{ ml: 1 }}>cancel</Icon>
              </Fab>
              <Fab variant="extended" onClick={handleSave} sx={{ ml: 1 }}>
                Save Changes
                <Icon sx={{ ml: 1 }}>save</Icon>
              </Fab>
            </>
          ) : (
            <Fab variant="extended" color={'primary'} onClick={handleAddClick} sx={{ ml: 1 }}>
              New
              <Icon sx={{ ml: 1 }}>add</Icon>
            </Fab>
          )}
        </Box>
      </Paper>
      {isAddingNewEntry && <NewEntryPopover onAction={handleNewEntryPopoverAction} users={users} />}
    </AppFrame>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Props>> => {
  const user = await getUserFromRequest(context.req);

  if (!user || user.role !== 'admin') {
    return {
      redirect: {
        destination: user ? '/app' : '/',
        permanent: false,
      },
    };
  }

  const entries = (await (await database).entries.find({}).toArray()) as DbEntry[];
  const users = (await (await database).users.find({}).toArray()) as DbUser[];

  const weekAgo = moment().subtract(1, 'week');
  const twoWeeksAgo = moment().subtract(2, 'weeks');
  const average7DayPerUser = users
    .filter((u) => u.role !== 'admin')
    .map((u) => entries.filter((e) => e.owner === u._id.toString()).reduce((res, e) => res + e.calories, 0));
  const stats: Stats = {
    newEntriesThisWeek: entries.filter((e) => moment(e.date).isAfter(weekAgo)).length,
    newEntriesLastWeek: entries.filter((e) => moment(e.date).isBetween(twoWeeksAgo, weekAgo)).length,
    averageCaloriesPerDay7Days: Math.floor(
      average7DayPerUser.reduce((res, val) => res + val, 0) / (average7DayPerUser.length || 1),
    ),
  };

  return {
    props: {
      user: sanitiseDbUser(user),
      users: users.map(sanitiseDbUser).filter((u) => u.role !== 'admin'),
      entries: entries.map(replaceId).reverse(),
      stats,
    },
  };
};

export default Admin;
