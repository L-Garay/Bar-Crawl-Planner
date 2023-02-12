// On this page, we will need to fetch all the outings for the signed in user
// we can grab ones where the creator_id matches the signed in user's id
// however, we will also need to grab outings where the signed in user is a member
// which means we'll need to iterate through the outing's profiles collection

import { gql, useQuery } from '@apollo/client';
import { Dynamic } from '~/components/animated/loadingSpinners';

const GET_OUTINGS = gql`
  query getAllOutings {
    getAllOutings {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export default function MyOutings() {
  const { loading, error, data } = useQuery(GET_OUTINGS);

  if (loading) {
    return <Dynamic />;
  }
  if (error) throw error;
  return (
    <div>
      <h1>My Outings</h1>
      {data.getAllOutings.map((outing: any) => {
        return (
          <div key={outing.id} style={{ display: 'flex' }}>
            <p style={{ paddingRight: 10 }}>{outing.name}</p>
            <p>{outing.start_date_and_time}</p>
          </div>
        );
      })}
    </div>
  );
}
