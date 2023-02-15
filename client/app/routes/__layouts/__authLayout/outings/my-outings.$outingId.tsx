import { gql, useMutation, useQuery } from '@apollo/client';
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

const SEND_EMAIL = gql`
  mutation sendOutingInvites(
    $outing_id: Int!
    $start_date_and_time: String!
    $emails: [String!]!
  ) {
    sendOutingInvites(
      outing_id: $outing_id
      start_date_and_time: $start_date_and_time
      emails: $emails
    )
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
  const [
    SendEmail,
    { loading: emailLoading, error: emailError, data: emailData },
  ] = useMutation(SEND_EMAIL);
  console.log(profilesData);
  console.log(emailData);

  // TODO will need to create mutation to send an email
  // it will need the recipient's email address and the outing id
  // the mutation will hit the resolver
  // we will need to use the email address to find the recipient's profile
  // then we pull the profile id and use the outing id to then use mailgen to generate the outing invitation template
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
            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const emails =
                  e.currentTarget['profile-email'].value.split(',');
                console.log(emails);
                // TODO: add validation to make sure emails are valid
                SendEmail({
                  variables: {
                    outing_id: outingId,
                    start_date_and_time:
                      outingData.getOuting.start_date_and_time,
                    emails,
                  },
                });
                e.currentTarget['profile-email'].value = '';
              }}
            >
              <label htmlFor="profile-email">Send invitation email to: </label>
              <input type="email" name="profile-email" id="profile-email" />
              <button type="submit">Send Invite</button>
            </form>
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
