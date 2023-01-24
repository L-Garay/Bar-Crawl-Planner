// import { gql, useQuery } from '@apollo/client';
import { Map as GoogleMap } from '~/components/maps';
import type { LoaderFunction } from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';
import getConfig from '~/utils/config.server';

export const loader: LoaderFunction = async ({ request }) => {
  return getConfig();
};

export default function OutingsIndex() {
  // const loaderData = useLoaderData();

  return (
    <>
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
          The main window/tab will be the 'featured' outing, either the nearest
          time wise or deliberately pinned/favorited by user
        </p>
        <small>
          It would be cool if there was a map of the outing's route and below it
          was all the outing details
        </small>
        <p>There will also be a tab of other upcomming/planned outings</p>
        <p>There will be a tab for saved previous outings</p>
        <p>
          You can click on one of the outings directly to see the details page,
          or click on the tab itself (maybe link) to then get redirected to a
          page to see ALL past/upcomming outings
        </p>
        <p>
          A tab (which will really just either open a modal or link to a new
          page) to create a new outing
        </p>
        <GoogleMap />
      </div>
    </>
  );
}
