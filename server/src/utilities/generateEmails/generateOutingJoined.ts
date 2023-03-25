import moment from 'moment';
import { GenerateOutingJoinedEmailInput, Email } from '../../types/sharedTypes';

const GenerateOutingJoinedEmail = ({
  outing_id,
  outing_name,
  start_date_and_time,
  senderName,
  names,
}: GenerateOutingJoinedEmailInput) => {
  const emails: Email[] = names.map((name: string) => {
    return {
      body: {
        name: name,
        intro: `${senderName} has joined the outing ${outing_name}! \n This event is scheduled for ${moment(
          start_date_and_time
        ).format('dddd, MMMM Do, h:mm:ss a')}.`,
        action: {
          instructions: 'To view this outing, please click the button below:',
          button: {
            color: '#ffb6c1',
            text: 'View Outing',
            link: `http://localhost:3000/outings/my-outings/${outing_id}`,
          },
        },
        outro:
          'Please be aware that anyone can be invited to an outing, if you do not recognize this person, please contact your group first. If the person is not part of your group, contact us at thecrawlmanager@gmail.com and we will investigate.',
      },
    };
  });
  return emails;
};

export default GenerateOutingJoinedEmail;
