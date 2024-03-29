import type { LinksFunction } from '@remix-run/node';
import mapsStyles from '~/generatedStyles/maps.css';
import globalStyles from '~/generatedStyles/global.css';
import friendsStyles from '~/generatedStyles/friends.css';
import outingStyles from '~/generatedStyles/outings.css';
import { Outlet } from '@remix-run/react';
import SimpleNav from '~/components/molecules/simpleNav';
import { useIsDomLoaded } from '~/utils/useIsDomLoaded';
import { Dynamic } from '~/components/animated/loadingSpinners';
import { useQuery } from '@apollo/client';
import { GET_PENDING_OUTINGS_COUNT } from '~/constants/graphqlConstants';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: globalStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: mapsStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: friendsStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: outingStyles,
      as: 'style',
    },
  ];
};

export default function OutingsIndex() {
  const isDomLoaded = useIsDomLoaded();
  const { data: outingsCount } = useQuery(GET_PENDING_OUTINGS_COUNT);
  const inviteCount = outingsCount ? outingsCount.getPendingOutingsCount : 0;

  const navLinks = [
    { name: 'Home', path: '/outings' },
    { name: 'Create an Outing', path: '/outings/create' },
    { name: 'My Outings', path: '/outings/my-outings' },
    {
      name: `Outing Invites${inviteCount >= 1 ? `(${inviteCount})` : ''}`,
      path: '/outings/invites',
    },
  ];

  return (
    <>
      {isDomLoaded ? (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.4',
          }}
        >
          <h1>This will be the outings 'hub'</h1>
          <p>
            Here I'm thinking we can have 'tabs/windows' (or just lists) of
            different sizes
          </p>
          <p>
            The main window/tab will be the 'featured' outing, either the
            nearest time wise or deliberately pinned/favorited by user
          </p>
          <small>
            It would be cool if there was a map of the outing's route and below
            it was all the outing details
          </small>
          <p>There will also be a tab of other upcomming/planned outings</p>
          <p>There will be a tab for saved previous outings</p>
          <p>
            You can click on one of the outings directly to see the details
            page, or click on the tab itself (maybe link) to then get redirected
            to a page to see ALL past/upcomming outings
          </p>

          <SimpleNav links={navLinks} />
          <Outlet />
        </div>
      ) : (
        <Dynamic />
      )}
    </>
  );
}

// I don't believe this specific file needs an error and catch boundary
// each specific outing page will have it's own, which should selectively render each section appropriately
