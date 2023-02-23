import { gql, useQuery } from '@apollo/client';
import type { ActionFunction } from '@remix-run/node';
import { Form, useTransition } from '@remix-run/react';
import React from 'react';
import { getNewClient } from '~/apollo/getClient';
import { Dynamic } from '~/components/animated/loadingSpinners';
import logApolloError from '~/utils/getApolloError';

// TODO need to investigate extraneous graphql calls I'm seeing in the network tab when visiting this Account page
// I'm seeing requests to the operation 'accounts', which was only being used when first developing this page as a quick test to make sure the query was working
// It returns all the accounts in the DB; but now I have switched the query to just look for a single user account
// This would suggest some caching issue, in which old queries are being are still being used
// So I need to think about how to detect old/stale cache data and how/when to best clear it
// Actually, the request seems to fire off on other pages too and it does not always fire off when visiting this page
const getAccount = gql`
  query getUserAccount {
    getUserAccount {
      email
      email_verified
      phone_number
      created_at
      deactivated
      id
    }
  }
`;

const updateAccount = gql`
  mutation updateUserAccount($email: String, $phone_number: String) {
    updateUserAccount(email: $email, phone_number: $phone_number) {
      email
      phone_number
    }
  }
`;

export const action: ActionFunction = async ({ request }) => {
  const client = await getNewClient(request);
  const formData = await request.formData();
  const phone_number = formData.get('phone_number')?.toString();

  const updatedUser = await client.mutate({
    mutation: updateAccount,
    variables: {
      phone_number: phone_number,
    },
  });
  const userData = updatedUser.data.updateUserAccount;

  return { userData };
};

export default function AccountIndex() {
  const { loading, error, data: accountData } = useQuery(getAccount);
  const transition = useTransition();

  const phoneRef = React.useRef<HTMLInputElement>(null);

  if (loading) {
    return <Dynamic />;
  }
  if (error) {
    logApolloError(error);
    throw error;
  }

  // Not super thrilled with this
  // Optimistically show the user's updated values, or their current value
  // Then once the sumbission process is over, the updated value should have then become their current value and it will remain in the UI
  const phoneToShow = transition.submission
    ? transition.submission?.formData.get('phone_number')
    : accountData
    ? accountData.getUserAccount.phone_number
    : null;

  return (
    <>
      {accountData ? (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.4',
          }}
        >
          <h1>This will be the Account page</h1>
          <small>{'Phone: ' + phoneToShow + ' '}</small>
          <p>
            This will probably be a pretty simple page content wise, as in it
            will only really edit the user's account data. Nothing else that I
            can think of currently.
          </p>
          <p>
            For now they can just update their phone. As updating emails would
            require a whole new process with Auth0, which may be implemented in
            the future. They also can not currently delete their account, but I
            can see soft deletes in the future.
          </p>
          <div className="form-container">
            <Form method="patch" action="/account">
              <label htmlFor="phone_number">Phone</label>
              <input type="text" name="phone_number" ref={phoneRef} />
              <button type="submit">Submit</button>
            </Form>
          </div>
        </div>
      ) : (
        <Dynamic />
      )}
    </>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  return (
    <main>
      <div className="error-container">
        <h1>
          Uh-oh looks like someone ran off with your account, don't worry we are
          tracking it down!
        </h1>
        <p>
          Please try again later, and if the issue still persists contact
          customer support
        </p>
        <small>Call (208) 999-8888 or email test@mail.com</small>
      </div>
    </main>
  );
}

// Will catch responses thrown from loaders and actions, any errors thrown from component will only get caught by error boundary
export function CatchBoundary() {
  return (
    <main>
      <div className="error-container">
        <h1>
          Uh-oh looks like someone ran off with your account, don't worry we are
          tracking it down!
        </h1>
        <p>
          Please try again later, and if the issue still persists contact
          customer support
        </p>
        <small>Call (208) 999-8888 or email test@mail.com</small>
      </div>
    </main>
  );
}
