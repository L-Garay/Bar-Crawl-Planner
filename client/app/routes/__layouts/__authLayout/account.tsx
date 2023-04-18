import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Dynamic } from '~/components/animated/loadingSpinners';
import { UPDATE_ACCOUNT, GET_ACCOUNT } from '~/constants/graphqlConstants';
import { VALID_PHONE_REGEX } from '~/constants/inputValidationConstants';
import type { BasicAccount } from '~/types/sharedTypes';
import logApolloError from '~/utils/getApolloError';

export default function AccountIndex() {
  const [account, setAccount] = useState<BasicAccount | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [phoneInputError, setPhoneInputError] = useState<boolean>(false);

  const PHONE_MAX = 14; // ex (208)-888-8888 = 10 digits + 2 dashes + 2 parenthesis = 14

  useQuery(GET_ACCOUNT, {
    onCompleted: (data) => {
      setAccount(data.getUserAccount);
    },
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
    },
  });

  const [updateAccount, { data: updateData, error: updateError }] = useMutation(
    UPDATE_ACCOUNT,
    {
      onError: (error) => {
        setShowError(true);
      },
    }
  );

  useEffect(() => {
    if (!account && showError) {
      throw new Error('Error getting account data');
    }
  }, [account, showError]);

  const phoneToShow = updateData
    ? updateData.updateUserAccount.phone_number
    : account?.phone_number;

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setShowError(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [showError]);

  return (
    <>
      {account ? (
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
            <label htmlFor="phone_number">Phone</label>
            <input
              type="text"
              name="phone_number"
              maxLength={PHONE_MAX}
              onChange={(event) => {
                setPhoneNumberInput(event.target.value);
              }}
            />
            <button
              onClick={() => {
                const regex = new RegExp(VALID_PHONE_REGEX);
                const match = regex.test(phoneNumberInput);
                if (match) {
                  updateAccount({
                    variables: {
                      phone_number: phoneNumberInput,
                    },
                  });
                  setPhoneNumberInput('');
                } else {
                  setShowError(true);
                  setPhoneInputError(true);
                }
              }}
            >
              Submit
            </button>
          </div>
          {showError && updateError ? (
            <div className="error-message">
              <p>We are unable to save your changes at this time.</p>
            </div>
          ) : showError && phoneInputError ? (
            <div className="error-message">
              <p>Phone number not formatted properly, please see examples.</p>
            </div>
          ) : null}
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
