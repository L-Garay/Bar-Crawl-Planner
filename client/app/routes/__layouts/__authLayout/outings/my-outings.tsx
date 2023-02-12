import { gql, useQuery } from '@apollo/client';
import { useNavigate } from '@remix-run/react';
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
  const navigate = useNavigate();

  if (loading) {
    return <Dynamic />;
  }
  if (error) throw error;

  return (
    <div>
      <h1>My Outings</h1>
      {data.getAllOutings.map((outing: any) => {
        return (
          <div
            key={outing.id}
            style={{ display: 'flex' }}
            onClick={() => navigate(`/outings/my-outings/${outing.id}`)}
          >
            <p style={{ paddingRight: 10 }}>{outing.name}</p>
            <p>{outing.start_date_and_time}</p>
          </div>
        );
      })}
    </div>
  );
}
