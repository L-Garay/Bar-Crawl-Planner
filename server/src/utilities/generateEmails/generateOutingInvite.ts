import moment from 'moment';
import {
  Email,
  GenerateOutingInviteEmailWithProfilesInput,
  GenerateOutingInviteEmailsWithAccountsInput,
} from '../../types/sharedTypes';

export const GenerateOutingInviteEmailWithProfiles = ({
  outing_name,
  outing_id,
  start_date_and_time,
  senderName,
  profiles,
}: GenerateOutingInviteEmailWithProfilesInput) => {
  const emails: Email[] = profiles.map((profile: Record<string, any>) => {
    return {
      body: {
        name: profile.name,
        intro: `You have been invited to a bar crawl called ${outing_name} by ${senderName}! \n This event is scheduled for ${moment(
          start_date_and_time
        ).format('dddd, MMMM Do, h:mm:ss a')}.`,
        action: {
          instructions: 'To accept this invite, please click the button below:',
          button: {
            color: '#ffb6c1',
            text: 'Accept Invite',
            link: `http://localhost:3000/outings/invites?redirectTo=/outings/invites&outingId=${outing_id}&profileId=${profile.id}&socialPin=${profile.social_pin}`,
          },
        },
        outro:
          "Please note, you must have a valid Bar Crawler account in order to join this outing.  If you do not currently have one, do not worry as we will create one for you if you accept.\n Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  });

  return emails;
};

export const GenerateOutingInviteEmailWithAccounts = ({
  outing_name,
  outing_id,
  start_date_and_time,
  senderName,
  accounts,
}: GenerateOutingInviteEmailsWithAccountsInput) => {
  const emails: Email[] = accounts.map((account: Record<string, any>) => {
    return {
      body: {
        name: account.profile.name,
        intro: `You have been invited to a bar crawl called ${outing_name} by ${senderName}! \n This event is scheduled for ${moment(
          start_date_and_time
        ).format('dddd, MMMM Do, h:mm:ss a')}.`,
        action: {
          instructions: 'To accept this invite, please click the button below:',
          button: {
            color: '#ffb6c1',
            text: 'Accept Invite',
            link: `http://localhost:3000/outings/invites?redirectTo=/outings/invites&outingId=${outing_id}&profileId=${account.profile.id}&socialPin=${account.profile.social_pin}`,
          },
        },
        outro:
          "Please note, you must have a valid Bar Crawler account in order to join this outing.  If you do not currently have one, do not worry as we will create one for you if you accept.\n Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  });

  return emails;
};
