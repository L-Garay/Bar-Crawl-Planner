import { gql, useQuery } from '@apollo/client';
import { useParams } from '@remix-run/react';

const GET_OUTING = gql`
  query getOuting($id: Int!) {
    getOuting(id: $id) {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export default function OutingDetails() {
  const outingId = Number(useParams().outingId);
  const { loading, error, data } = useQuery(GET_OUTING, {
    variables: { id: outingId },
  });

  return (
    <div>
      {data ? (
        <>
          <h1>{data.getOuting.name}</h1>
          <p>{data.getOuting.start_date_and_time}</p>
          <p>{data.getOuting.place_ids}</p>
        </>
      ) : (
        <p>Outing not found</p>
      )}
    </div>
  );
}
