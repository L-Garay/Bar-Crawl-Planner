import moment from 'moment';

export const GenerateOutingInviteEmail = (
  outing_id: number,
  start_date_and_time: string,
  profiles: Record<string, any>[],
  senderName: string
) => {
  const emails = profiles.map((profile: Record<string, any>) => {
    return {
      body: {
        name: profile.name,
        intro: `You have been invited to a bar crawl by ${senderName}! \n This event is scheduled for ${moment(
          start_date_and_time
        ).format('dddd, MMMM Do, h:mm:ss a')}.`,
        action: {
          instructions: 'To accept this invite, please click the button below:',
          button: {
            color: '#ffb6c1',
            text: 'Accept Invite',
            link: `http://localhost:3000/outinginvite/${outing_id}/${profile.id}`,
          },
        },
        outro:
          "Please note, you must have a valid Bar Crawler account in order to join this outing. Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  });

  return emails;
};