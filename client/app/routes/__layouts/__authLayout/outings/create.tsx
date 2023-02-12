import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getNewClient } from '~/apollo/getClient';
import { Map as GoogleMap } from '~/components/maps';
import { CREATE_OUTING } from '~/components/maps/basicMap';
import getConfig from '~/utils/config.server';

export const loader: LoaderFunction = async ({ request }) => {
  // Even though we aren't explicitly using the config data in this component file
  // it is still required for the map to work properly
  return getConfig();
};

export const action: ActionFunction = async ({ request }) => {
  const client = await getNewClient(request);
  const formData = await request.formData();
  const name = formData.get('outing-name')?.toString();
  const start_date_and_time = formData.get('outing-time')?.toString();
  const place_idString = formData.get('place-ids')?.toString();
  const place_idArray = place_idString?.split(',');
  const created_at = new Date().toISOString();
  let createdOuting: any;
  try {
    createdOuting = await client.mutate({
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
  if (createdOuting) {
    // TODO don't like the idea of using the very simple/small/easily guessable/targetabble outing id that is assigned by the database
    // we should look to use a more secure id like using crypto.randomUUID()
    return redirect(
      `/outings/my-outings/${createdOuting.data.createOuting.id}`
    );
  }
  return null;
};

export default function CreateOuting() {
  return (
    <div>
      <h1>Creat an outing</h1>
      <GoogleMap />
    </div>
  );
}
