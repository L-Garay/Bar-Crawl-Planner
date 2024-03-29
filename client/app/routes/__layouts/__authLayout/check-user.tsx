import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Basic as BasicSpinner } from '~/components/animated/loadingSpinners';
import { authenticator } from '~/auth/authenticator';
import {
  UPDATE_ACCOUNT_BY_SOCIAL_PIN,
  CREATE_ACCOUNT_AND_PROFILE,
  GET_ACCOUNT_WITH_PROFILE_DATA,
} from '~/constants/graphqlConstants';
import spinnerStyles from '~/generatedStyles/spinners.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: spinnerStyles,
      as: 'style',
    },
  ];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  return await authenticator.isAuthenticated(request);
};

export default function CheckUser() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const [inviteData, setInviteData] = useState<string | null>(null);
  const [redirectToUrl, setRedirecToUrl] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState<boolean | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);

  const [getAccountWithProfileData] = useLazyQuery(
    GET_ACCOUNT_WITH_PROFILE_DATA,
    {
      context: {
        headers: {
          inviteData: inviteData,
        },
      },
    }
  );
  const [updateAccountBySocialPin] = useMutation(UPDATE_ACCOUNT_BY_SOCIAL_PIN, {
    context: {
      headers: {
        inviteData: inviteData,
      },
    },
  });
  const [createAccountAndProfile] = useMutation(CREATE_ACCOUNT_AND_PROFILE, {
    context: {
      // NOTE hate this, this is for testing purposes
      headers: {
        inviteData: inviteData,
      },
    },
  });

  // Attempt to get inviteData and redirectTo from local storage if there
  useEffect(() => {
    console.log(
      'attempting to set invite data and redirectTo from local storage on component mount'
    );
    setInviteData(localStorage.getItem('inviteData'));
    setRedirecToUrl(localStorage.getItem('redirectTo'));
  }, []);

  // Once the loader data is sent, pull the email from the authData
  useEffect(() => {
    if (loaderData) {
      console.log('attempting to set email from loaderData and authData');
      const email = loaderData.authData.profile.emails[0].value;
      console.log('EMAIL: ', email);

      setEmail(email);
    }
  }, [loaderData, setEmail]);

  // Once the email is set, make a call to the backend to see if there is an account with that email
  useEffect(() => {
    if (email) {
      console.log('attempting to get account by email');
      const getAccountFunction = async () => {
        const data = await getAccountWithProfileData({ variables: { email } });

        if (data.data.getAccountWithProfileData && inviteData) {
          const { profileId } = JSON.parse(inviteData);

          const signedInAccountProfileId =
            data.data.getAccountWithProfileData.profile.id;
          if (signedInAccountProfileId != profileId) {
            // if somehow a user clicks on an invite sent to someone else and logs in, and the profile ids do not match, just redirect them to the homepage
            console.log(
              'signed in account profile id does not match profile id from invite data, redirecting to homepage'
            );
            window.localStorage.removeItem('inviteData');
            window.localStorage.removeItem('redirectTo');
            navigate('/homepage');
          } else {
            // if account exists we need to send them to the outing invites page so they can accept/decline invite
            console.log(
              'found account by email, has invite data, redirecting to outing invites page'
            );
            window.localStorage.removeItem('inviteData');
            window.localStorage.removeItem('redirectTo');
            navigate(redirectToUrl ? redirectToUrl : '/outing-invites');
          }
        } else if (data.data.getAccountWithProfileData && !inviteData) {
          // if there is an account and they are not coming from an invite, we need to check if there is a returnToUrl that was fetched from local storage
          console.log(
            'found and account by email with no invite data and now redirecting to homepage or redirectToUrl'
          );
          const url = redirectToUrl ? redirectToUrl : '/homepage';
          window.localStorage.removeItem('redirectTo');
          navigate(url);
        } else {
          // otherwise no account was found, set hasAccount to false
          console.log(
            'did not find an account by email, setting hasAccount to false'
          );

          setHasAccount(false);
        }
      };

      getAccountFunction();
    }
  }, [email, getAccountWithProfileData, inviteData, navigate, redirectToUrl]);

  // NOTE this would indicate that there is no account, that the user is coming from an invite, and they signed into Auth0 with a different email than the one they were invited with
  // If account does not exist, fire off a mutation using the social pin to find the pre-created profile, find the associated account, and update account with the email just recieved from Auth0
  // then we also need to connect the newly claimed profile to the outing, and change the status from pending to accepted
  // then redirect to the returnTo url
  useEffect(() => {
    if (hasAccount === false && inviteData) {
      const { profileId, socialPin, outingId } = JSON.parse(inviteData);
      console.log(
        'attempting to update account by social pin',
        profileId,
        socialPin,
        outingId
      );
      const claimAccountAndConnectProfile = async () => {
        const data = await updateAccountBySocialPin({
          variables: {
            profile_id: Number(profileId),
            social_pin: socialPin,
            email,
          },
        });
        if (data.errors) {
          // TODO not sure what to do in this situation, if they can't claim the account/profile
          // should we just put them in the regular flow and have them create a new account/profile?
          // we should be able to clean up the pre-created, bad, unclaimed account/profile by using the social pin and profile id
          // and then also disconnect the pre-created profile from the outing
          // then as part of the regular flow, maybe we can include some logic to check if they are coming from a failed claim attempt
          // and then try to connect the new account/profile to the outing
          console.log('error updating account by social pin');
          console.log(data.errors);
        }
        if (data.data.UpdateAccountBySocialPin) {
          console.log(
            'successfully updated account by social pin, now redirecting to returnToUrl'
          );
          window.localStorage.removeItem('inviteData');
          window.localStorage.removeItem('redirectTo');
          navigate(redirectToUrl ? redirectToUrl : '/outing-invites');
        }
      };
      claimAccountAndConnectProfile();
    }
  }, [
    hasAccount,
    inviteData,
    navigate,
    updateAccountBySocialPin,
    redirectToUrl,
    email,
  ]);

  // NOTE this would indicate that there is no account, that the user is not coming from an invite, and that they just signed up with Auth0
  // this would be considered the 'normal' flow for signing up now
  useEffect(() => {
    if (hasAccount === false && !inviteData) {
      const variables = {
        name: loaderData.authData.profile.displayName,
        picture: loaderData.authData.profile.photos[0].value,
        email: loaderData.authData.profile.emails[0].value,
        verified: false,
      };
      console.log(
        'attempting to create account and profile',
        JSON.stringify(Object.values(variables))
      );
      const createAccountAndProfileFunction = async () => {
        const data = await createAccountAndProfile({ variables: variables });
        if (data.errors) {
          navigate('/logout');
          // NOTE not sure what to do in this case, have them try again on our end?
          // would probably need some cleanup on the backend to remove the broken account(s) and profile(s) that were created
          console.log('error creating account and profile');
          console.log(data.errors);
        }
        if (data.data.CreateAccountAndProfile) {
          console.log(
            'successfully created account and profile, redirecting to homepage or redirectToUrl'
          );
          const url = redirectToUrl ? redirectToUrl : '/homepage';
          window.localStorage.removeItem('redirectTo');
          navigate(url);
        }
      };
      createAccountAndProfileFunction();
    }
  }, [
    loaderData,
    createAccountAndProfile,
    hasAccount,
    inviteData,
    navigate,
    redirectToUrl,
  ]);

  return (
    <div>
      <BasicSpinner />
    </div>
  );
}
