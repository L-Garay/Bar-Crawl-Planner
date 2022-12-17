// import { gql, useQuery } from '@apollo/client';
// import { Dynamic } from '~/components/animated/loadingSpinners';

// TODO need to set up a query to get the user's profile data in server
// const getProfile = gql`
//   query profile {
//     profile {
//       name
//     }
//   }
// `;

export default function OutingsIndex() {
  // const { loading, error, data } = useQuery(getProfile);

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
        <h1>This will be the outings 'hub'</h1>
        <p>
          Here I'm thinking we can have 'tabs/windows' (or just lists) of
          different sizes
        </p>
        <p>
          The main window/tab will be the 'featured' outing, either the nearest
          time wise or deliberately pinned/favorited by user
        </p>
        <small>
          It would be cool if there was a map of the outing's route and below it
          was all the outing details
        </small>
        <p>There will also be a tab of other upcomming/planned outings</p>
        <p>There will be a tab for saved previous outings</p>
        <p>
          You can click on one of the outings directly to see the details page,
          or click on the tab itself (maybe link) to then get redirected to a
          page to see ALL past/upcomming outings
        </p>
        <p>
          A tab (which will really just either open a modal or link to a new
          page) to create a new outing
        </p>
        <p></p>
      </div>
    </>
  );
}
