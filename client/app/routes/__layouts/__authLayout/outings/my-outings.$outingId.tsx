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
                // const trimmedEmails = emails.map((email: string) => email.trim());
                // console.log(trimmedEmails);

                // TODO: add validation to make sure emails are valid
                // TODO: add logic to check and ensure that only the outing creator can send invites (is this desired?)

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
