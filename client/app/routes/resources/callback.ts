import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';
import fs from 'fs';

export const loader: LoaderFunction = async ({ request, context }) => {
  let fileData: string = '';
  try {
    fileData = fs.readFileSync('/tmp/barcrawl', 'utf8');
  } catch (error) {
    console.log('Error reading file', error);
  }

  let returnToUrl: string = '/homepage';
  if (fileData) {
    // this code block should only get hit if there is data in the file
    // that would indicate that there is a returnTo value that needs to be read
    // however, if there is no returnTo value, we can just redirect to the homepage
    const parsedFileData = JSON.parse(fileData);
    // NOTE each resource page or other will be responsible for parsing the returnTo value into the login page, so that it may be properly stored and used here
    // The login and callback routes should never care/know about the specific returnTo pages
    const { returnTo } = parsedFileData;
    returnToUrl = returnTo ? returnTo : returnToUrl;
  }

  // this would indicate that there is no returnTo data that needs to be read
  // meaning we can just redirect to the homepage
  return await authenticator.authenticate('auth0', request, {
    successRedirect: returnToUrl,
    failureRedirect: '/',
    context,
  });
};
