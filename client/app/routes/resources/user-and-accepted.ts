import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getNewClient } from '~/apollo/getClient';
import { CONNECT_PROFILE } from './outinginvite';
import fs from 'fs';

export const loader: LoaderFunction = async ({ request, context }) => {
  let fileData: string = '';
  try {
    fileData = fs.readFileSync('/tmp/barcrawl', 'utf8');
    console.log('fileData', fileData);
  } catch (error) {
    console.log('Error reading file', error);
  }

  if (fileData) {
    const parsedFileData = JSON.parse(fileData);
    const { profileId, outingId } = parsedFileData;

    try {
      const client = await getNewClient(request);
      await client.mutate({
        mutation: CONNECT_PROFILE,
        variables: {
          profile_id: Number(profileId),
          outing_id: Number(outingId),
        },
      });
    } catch (error: any) {
      const customError = error.networkError
        ? error.networkError.result.errors[0]
        : error;
      console.log('Error connecting profile and outing', customError);
    }

    const outingUrl = `/outings/my-outings/${outingId}`;
    return redirect(outingUrl);
  }
  return redirect('/homepage');
};
