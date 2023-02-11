// import { gql, useQuery } from '@apollo/client';
import { Map as GoogleMap } from '~/components/maps';
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/node';
// import { useLoaderData } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import outingsStyles from '~/generatedStyles/outingspage.css';
import { getNewClient } from '~/apollo/getClient';
import { CREATE_OUTING } from '~/components/maps/basicMap';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: outingsStyles,
      as: 'style',
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const client = await getNewClient(request);
  const formData = await request.formData();
  const name = formData.get('outing-name')?.toString();
  const start_date_and_time = formData.get('outing-time')?.toString();
  const place_idString = formData.get('place-ids')?.toString();
  const place_idArray = place_idString?.split(',');
  const created_at = new Date().toISOString();

  try {
    await client.mutate({
      mutation: CREATE_OUTING,
      variables: {
        name,
        start_date_and_time,
        created_at,
        place_ids: place_idArray,
      },
      fetchPolicy: 'no-cache',
    });
  } catch (error) {
    console.error(error);
  }
  return null;
};

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

        <GoogleMap />
      </div>
    </>
  );
}
