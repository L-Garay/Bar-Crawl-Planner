// import { gql, useQuery } from '@apollo/client';
// import { Dynamic } from '~/components/animated/loadingSpinners';

// TODO need to set up a query to get the user's account data in server
// const getAccount = gql`
//   query account {
//     account {
//       email
//     }
//   }
// `;

export default function AccountIndex() {
  // const { loading, error, data } = useQuery(getAccount);

  // if (loading) {
  //   return <Dynamic />;
  // }
  // if (error) throw error;

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Account page</h1>
        <p>
          This will probably be a pretty simple page content wise, as in it will
          only really edit the user's account data. Nothing else that I can
          think of currently.
        </p>
        <p>
          This will be where they can delete their account, will need to think
          about whether we'll do a hard delete of the profile and a soft delete
          of the account OR a hard delete of both OR a soft delete of both.
        </p>
      </div>
    </>
  );
}
