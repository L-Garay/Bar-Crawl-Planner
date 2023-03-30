import { Email } from '../../types/sharedTypes';

const GenerateFriendRequestEmail = (
  senderName: string,
  addresseeName: string
) => {
  const email: Email = {
    body: {
      name: addresseeName,
      intro: `${senderName} has sent you a friend request! This will make it easier to invite each other to outings, along with other things that are TBD.`,
      action: {
        instructions: 'To respond to the request, please click the link below:',
        button: {
          color: '#ffb6c1',
          text: 'Friends Page',
          link: `http://localhost:3000/friends?redirectTo=/friends`,
        },
      },
      outro:
        'You will be required to log in to your account, once you have done so you should be redirected to your Friends page.\n If you do not know this person, you have the option to Block them and you will no longer recieve any requests from them.',
    },
  };
  return email;
};

export default GenerateFriendRequestEmail;
