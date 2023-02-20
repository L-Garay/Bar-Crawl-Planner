import type { LoaderFunction } from '@remix-run/node';
import { CONNECT_PROFILE } from '../outinginvite';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Basic as BasicSpinner } from '~/components/animated/loadingSpinners';
import { authenticator } from '~/auth/authenticator';

const GET_ACCOUNT = gql`
  query getAccountByEmail($email: String!) {
    getAccountByEmail(email: $email) {
      id
      email
    }
  }
`;

const UPDATE_ACCOUNT_BY_SOCIAL_PIN = gql`
  mutation UpdateAccountBySocialPin(
    $profile_id: Int!
    $social_pin: String!
    $email: String!
  ) {
    UpdateAccountBySocialPin(
      profile_id: $profile_id
      social_pin: $social_pin
      email: $email
    ) {
      id
      email
    }
  }
`;

const CREATE_ACCOUNT_AND_PROFILE = gql`
  mutation CreateAccountAndProfile(
    $name: String!
    $picture: String!
    $email: String!
    $verified: Boolean!
  ) {
    CreateAccountAndProfile(
      name: $name
      picture: $picture
      email: $email
      verified: $verified
    )
  }
`;

export const loader: LoaderFunction = async ({ request, context }) => {
  return await authenticator.isAuthenticated(request);
};

export default function CheckUser() {
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState<boolean | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [
    getAccount,
    { data: accountData, loading: accountLoading, error: accountError },
  ] = useLazyQuery(GET_ACCOUNT, {
    context: {
      headers: {
        inviteData: inviteData,
      },
    },
  });
  const [
    updateAccountBySocialPin,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(UPDATE_ACCOUNT_BY_SOCIAL_PIN, {
    context: {
      headers: {
        inviteData: inviteData,
      },
    },
  });
  const [
    createAccountAndProfile,
    { data: creationData, loading: creationLoading, error: creationError },
  ] = useMutation(CREATE_ACCOUNT_AND_PROFILE);
  const [
    ConnectProfile,
    {
      loading: connectionLoading,
      error: connectionError,
      data: connectionData,
    },
  ] = useMutation(CONNECT_PROFILE);

  // Attempt to get inviteData from local storage if there
  useEffect(() => {
    console.log(
      'attempting to set invite data from local storage on component mount'
    );
    setInviteData(localStorage.getItem('inviteData'));
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
        const data = await getAccount({ variables: { email } });

        if (data.data.getAccountByEmail && inviteData) {
          // if account exists redirect them to the returnTo(outing details page) here
          // TODO we need to connect the profile associated with the found account, to the outing for the invite found in the inviteData
          const { outingId } = JSON.parse(inviteData);
          // const connectionData = await ConnectProfile({
          //   variables: {
          //     profile_id: Number(profileId),
          //     outing_id: Number(outingId),
          //   },
          // });
          // if (connectionData.errors) {
          //   console.log('error connecting profile to outing');
          //   console.log(connectionData.errors);
          //   // maybe redirect to an error page here
          // }
          console.log(
            'found and account by email and now redirecting to outing details page with outingId: ',
            outingId
          );
          window.localStorage.removeItem('inviteData');
          navigate(`/outings/my-outings/${outingId}`);
        } else if (data.data.getAccountByEmail && !inviteData) {
          // if there is an account and they are not coming from an invite, redirect them to the homepage
          console.log(
            'found and account by email and now redirecting to homepage'
          );
          navigate('/homepage');
        } else {
          // otherwise set hasAccount to false
          console.log(
            'did not find an account by email, setting hasAccount to false'
          );

          setHasAccount(false);
        }
      };

      getAccountFunction();
    }
  }, [ConnectProfile, email, getAccount, inviteData, navigate]);

  // NOTE this would indicate that there is no account, that the user is coming from an invite, and they signed into Auth0 with a different email than the one they were invited with
  // If account does not exist, fire off a mutation using the social pin to find the pre-created profile, find the associated account, update account with the email just recieved from Auth0, and then redirect to returnTo
  useEffect(() => {
    if (hasAccount === false && inviteData) {
      const { returnTo, profileId, socialPin } = JSON.parse(inviteData);
      console.log(
        'attempting to update account by social pin',
        returnTo,
        profileId,
        socialPin
      );
      const updateAccountBySocialPinFunction = async () => {
        const data = await updateAccountBySocialPin({
          variables: {
            profile_id: Number(profileId),
            social_pin: socialPin,
            email,
          },
        });
        if (data.errors) {
          console.log('error updating account by social pin');
          console.log(data.errors);
        }
        if (data.data.UpdateAccountBySocialPin) {
          console.log(
            'successfully updated account by social pin, attempting to redirect to returnTo: ',
            returnTo
          );
          window.localStorage.removeItem('inviteData');
          navigate(returnTo);
        }
      };
      updateAccountBySocialPinFunction();
    }
  }, [hasAccount, inviteData, navigate, updateAccountBySocialPin, email]);

  // NOTE this would indicate that there is no account, that the user is not coming from an invite, and that they just signed up with Auth0
  // this would be considered the 'normal' flow for signing up now
  useEffect(() => {
    if (hasAccount === false && !inviteData) {
      // TODO fire off mutation to create account and profile (same flow as from the authenticator callback function)
      // probably want this specific mutation to handle both account and profile creation
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
          // NOTE not sure what to do in this case, have them try again on our end?
          // would probably need some cleanup on the backend to remove the broken account(s) and profile(s) that were created
          console.log('error creating account and profile');
          console.log(data.errors);
        }
        if (data.data.CreateAccountAndProfile) {
          console.log(
            'successfully created account and profile, redirecting to homepage'
          );
          navigate('/homepage');
        }
      };
      createAccountAndProfileFunction();
    }
  }, [loaderData, createAccountAndProfile, hasAccount, inviteData, navigate]);

  return (
    <div>
      <BasicSpinner />
    </div>
  );
}
