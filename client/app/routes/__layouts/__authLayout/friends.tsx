// import { gql, useQuery } from '@apollo/client';
// import { Dynamic } from '~/components/animated/loadingSpinners';

// TODO need to set up a query to get the user's profile data in server
// const getProfileAndFriends = gql`
//   query profielAndFriends {
//     profile {
//       name
//     }
//     friends {
//       name
//     }
//   }
// `;

export default function FriendsIndex() {
  // const { loading, error, data } = useQuery(getProfileAndFriends);

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
        <h1>This will be the friends page</h1>
        <p>I'm not entirely sure how I want this page to look</p>
        <p>
          I think one option of UI should be just a list of friend information
          (for ease of searching)
        </p>
        <p>And then there should be a more interactive/cool display/list</p>
        <p>However, how those two look/work I'm not sure</p>
        <p>
          There will also need to be tab/section to be able to search/add
          friends
        </p>
        <b>
          Which brings me to something I'd like to implement regarding
          friends/profiles. I'd like to be able to add friends either by phone
          number, or by a randomly generated and assigned PIN of some sort.
        </b>
        <small>
          The PIN will be generated and assigned upon profile creation
        </small>
      </div>
    </>
  );
}
