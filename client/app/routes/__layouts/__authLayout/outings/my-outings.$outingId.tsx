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

const GET_PROFILES_IN_OUTING = gql`
  query getProfilesInOuting($id: Int!) {
    getProfilesInOuting(id: $id) {
      id
      name
      profile_img
      social_pin
    }
  }
`;

export default function OutingDetails() {
  const outingId = Number(useParams().outingId);
  const {
    loading: outingLoading,
    error: outingError,
    data: outingData,
  } = useQuery(GET_OUTING, {
    variables: { id: outingId },
  });
  const {
    loading: profilesLoading,
    error: profilesError,
    data: profilesData,
  } = useQuery(GET_PROFILES_IN_OUTING, {
    variables: { id: outingId },
  });
  console.log(profilesData);

  // TODO will need to create mutation to send an email
  // it will need the recipient's email address and the outing id
  // the mutation will hit the resolver
  // which will then use mailgen to generate the outing invitation template
  // the template will include a button that will link to a Remix resource route
  // we will need to make sure the route includes the outing id and the recipient's profile id
  // that route will then use the action function to make a call to our server (probably a mutation again), and pull the outing id and the recipient's profile id from the url params
  // this final mutation will take in both ids and finally add the recipient's profile id to the outing's profile_ids array

  return (
    <div>
      {outingData && profilesData ? (
        <>
          <h1>{outingData.getOuting.name}</h1>
          <p>{outingData.getOuting.start_date_and_time}</p>
          <p>{outingData.getOuting.place_ids}</p>
          <br />
          <div className="add-profiles">
            <label htmlFor="profile-email">Send invitation email to: </label>
            <input type="email" name="profile-email" id="profile-email" />
            <button>Send Invite</button>
          </div>
          <h4>Profiles in Outing</h4>
          {profilesData.getProfilesInOuting.map((profile: any) => {
            return (
              <div key={profile.id}>
                <p>
                  {profile.name} with id {profile.id}
                </p>
              </div>
            );
          })}
        </>
      ) : (
        <p>Outing not found</p>
      )}
    </div>
  );
}
