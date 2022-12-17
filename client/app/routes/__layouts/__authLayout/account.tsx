import { gql, useMutation, useQuery } from '@apollo/client';
import { Form } from '@remix-run/react';
import React from 'react';
import { Dynamic } from '~/components/animated/loadingSpinners';

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
      deleted
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

export default function AccountIndex() {
  const { loading, error, data: accountData } = useQuery(getAccount);

  const phoneRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const [updateUserAccount, { data: mutationData }] =
    useMutation(updateAccount);

  if (loading) {
    return <Dynamic />;
  }
  if (error) throw error;

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const phone = phoneRef.current?.value;
    const email = emailRef.current?.value;
    console.log(phone);

    updateUserAccount({ variables: { email, phone_number: phone } });
    event.target.reset();
  };

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
          <small>{'Email: ' + accountData.getUserAccount.email + ' '}</small>
          <small>
            {'Phone: ' + accountData.getUserAccount.phone_number + ' '}
          </small>
          <p>
            This will probably be a pretty simple page content wise, as in it
            will only really edit the user's account data. Nothing else that I
            can think of currently.
          </p>
          <p>
            This will be where they can delete their account, will need to think
            about whether we'll do a hard delete of the profile and a soft
            delete of the account OR a hard delete of both OR a soft delete of
            both.
          </p>
          <div className="form-container">
            {/* TODO need to figure out how to have data auto update after submission */}
            <Form replace onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input type="text" name="email" ref={emailRef} />
              <label htmlFor="phone">Phone</label>
              <input type="text" name="phone" ref={phoneRef} />
              <button type="submit">Update</button>
            </Form>
          </div>
        </div>
      ) : (
        <Dynamic />
      )}
    </>
  );
}
