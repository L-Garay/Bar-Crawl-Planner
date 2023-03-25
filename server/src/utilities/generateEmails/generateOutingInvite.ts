import moment from 'moment';
import {
  GenerateOutingInviteEmailParams,
  Email,
} from '../../types/sharedTypes';

const GenerateOutingInviteEmail = ({
  outing_name,
  outing_id,
  start_date_and_time,
  profiles,
  senderName,
}: GenerateOutingInviteEmailParams) => {
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
            link: `http://localhost:3000/outinginvite?outingId=${outing_id}&profileId=${profile.id}&socialPin=${profile.social_pin}`,
          },
        },
        outro:
          "Please note, you must have a valid Bar Crawler account in order to join this outing.  If you do not currently have one, do not worry as we will create one for you if you accept.\n Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  });

  return emails;
};

export default GenerateOutingInviteEmail;
