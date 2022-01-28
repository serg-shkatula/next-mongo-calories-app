import React, { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import database from '../../utils/database';
import { GetServerSideProps } from 'next/types';
import { DbEntry, Entry, User } from '../../types';
import { getUserFromRequest, replaceId, sanitiseDbUser } from '../../functions';
import { useRouter } from 'next/router';
import EntriesTable from '../../components/EntriesTable';
import AppFrame from '../../components/AppFrame';
import moment from 'moment';
import { SxProps, Theme } from '@mui/material/styles';
import { Accordion, AccordionDetails, AccordionSummary, Fab, Icon, Paper, Tooltip, Typography } from '@mui/material';
import NewEntryPopover from '../../components/NewEntryPopover';
import { entriesApiCall } from '../../utils/api';
import DateFilter, { defaultDateFilterState } from '../../components/DateFilter';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1,
    pb: 2,
  } as SxProps<Theme>,
  group: {
    //
  },
  addButton: {
    position: 'sticky',
    bottom: 24,
    mt: 2,
    mb: 2,
  },
};

type Props = {
  user?: User;
  entries?: Entry[];
};

type EntriesGroup = { name: string; entries: Entry[]; isToday?: boolean };

const UserApp: React.FC<Props> = ({ user, entries }) => {
  const [dateFilterState, setDateFilterState] = useState<{ left: string; right: string }>(defaultDateFilterState);
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [entriesGrouped, setEntriesGrouped] = useState<EntriesGroup[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) router?.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!entries) return;

    const newEntriesGrouped: EntriesGroup[] = [];
    const groupsByName: { [key: string]: EntriesGroup } = {};

    const leftMoment = moment(dateFilterState.left);
    const rightMoment = moment(dateFilterState.right);
    entries
      .filter((e) => {
        const entryMoment = moment(e.date);
        return (
          (!dateFilterState.left || entryMoment.isAfter(leftMoment)) &&
          (!dateFilterState.right || entryMoment.isBefore(rightMoment))
        );
      })
      .sort((a, b) => (moment(a.date).isBefore(moment(b.date)) ? 1 : -1))
      .forEach((entry) => {
        const date = moment(entry.date);
        const isToday = date.isSame(moment(), 'day');
        const name = isToday
          ? 'Today'
          : date.isSame(moment().subtract(1, 'day'), 'day')
          ? 'Yesterday'
          : date.format(`ddd Do MMM${date.year() !== moment().year() ? ', YYYY' : ''}`);
        let group = groupsByName[name];
        if (!group) {
          group = { name, entries: [], isToday };
          groupsByName[name] = group;
          newEntriesGrouped.push(group);
        }
        group.entries.push(entry);
      });

    setEntriesGrouped(newEntriesGrouped);
  }, [entries, dateFilterState]);

  const renderedGroups = useMemo(
    () =>
      entriesGrouped.map((group) => {
        const total = group.entries.reduce((res, e) => {
          return res + e.calories;
        }, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const limitExceeded = user ? total > user.maxCaloriesPerDay! : false;
        return (
          <Accordion elevation={0} key={group.name} sx={classes.group} defaultExpanded={group.isToday} disableGutters>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Typography>{group.name}</Typography>
              <Typography marginLeft={'auto'} marginRight={1} sx={{ color: 'gray' }}>
                {total} cal{' '}
                {limitExceeded && (
                  <Tooltip title={`Limit of ${user?.maxCaloriesPerDay} cal per day exceeded`}>
                    <Icon style={{ fontSize: '1em', marginBottom: -2 }} color={'error'}>
                      warning
                    </Icon>
                  </Tooltip>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EntriesTable data={group.entries} />
            </AccordionDetails>
          </Accordion>
        );
      }),
    [entriesGrouped, user],
  );

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
    [setIsAddingNewEntry, setIsFetching, router],
  );

  const handleAddClick = useCallback(() => setIsAddingNewEntry(true), [setIsAddingNewEntry]);

  if (!user) return null;

  return (
    <AppFrame
      title={'Your Calories'}
      description={'Calories App User Dashboard'}
      user={user}
      sx={isFetching ? { opacity: 0.35, pointerEvents: 'none' } : {}}
      contentSx={classes.content}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          flex: !renderedGroups.length ? 1 : undefined,
        }}
        elevation={12}
      >
        <DateFilter onChange={setDateFilterState} />
        {renderedGroups.length ? renderedGroups : <Typography sx={{ m: 'auto', pb: 10 }}>no entries 🤷‍♂️</Typography>}
      </Paper>
      <Fab variant="extended" sx={classes.addButton} color={'primary'} onClick={handleAddClick}>
        New Entry
        <Icon sx={{ ml: 1 }}>add</Icon>
      </Fab>
      {isAddingNewEntry && <NewEntryPopover onAction={handleNewEntryPopoverAction} />}
    </AppFrame>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const user = await getUserFromRequest(context.req);

  const isAdmin = user?.role === 'admin';
  if (!user || isAdmin) {
    return {
      redirect: {
        destination: isAdmin ? '/admin' : '/',
        permanent: false,
      },
    };
  }

  const entries = (await (await database).entries.find({ owner: user._id.toString() }).toArray()) as DbEntry[];

  return {
    props: {
      user: sanitiseDbUser(user),
      entries: entries.map(replaceId),
    },
  };
};

export default UserApp;
