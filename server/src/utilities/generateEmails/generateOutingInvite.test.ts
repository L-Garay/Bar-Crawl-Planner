import { GenerateOutingInviteEmailWithProfilesInput } from '../../types/sharedTypes';
import { GenerateOutingInviteEmailWithProfiles } from '.';

const mockFormat = jest.fn(() => 'Wednesday, January 1st, 12:00:00 pm');
const mockMomentObject = {
  format: mockFormat,
};
jest.mock('moment', () => ({
  __esModule: true,
  default: jest.fn(() => mockMomentObject),
}));

const singleProfile: GenerateOutingInviteEmailWithProfilesInput = {
  outing_name: 'Outing 1',
  outing_id: 1,
  start_date_and_time: '2021-01-01 12:00:00',
  profiles: [{ id: 1, name: 'Profile 1', social_pin: 'abcd' }],
  senderName: 'Bob Smith',
};
const doubleProfiles: GenerateOutingInviteEmailWithProfilesInput = {
  ...singleProfile,
  profiles: [
    { id: 1, name: 'Profile 1', social_pin: 'abcd' },
    { id: 2, name: 'Profile 2', social_pin: 'efgh' },
  ],
};

describe('GenerateOutingInviteEmail', () => {
  it('should return the correct number of emails for the number of profiles', () => {
    const singleEmail = GenerateOutingInviteEmailWithProfiles(singleProfile);
    expect(singleEmail).toHaveLength(1);
    const doubleEmails = GenerateOutingInviteEmailWithProfiles(doubleProfiles);
    expect(doubleEmails).toHaveLength(2);
  });
  it('should return the correct name for each email', () => {
    const doubleEmails = GenerateOutingInviteEmailWithProfiles(doubleProfiles);
    expect(doubleEmails[0]).toHaveProperty('body');
    expect(doubleEmails[0].body).toHaveProperty('name', 'Profile 1');
    expect(doubleEmails[1].body).toHaveProperty('name', 'Profile 2');
  });
  it('should call moment once for each email', () => {
    GenerateOutingInviteEmailWithProfiles(doubleProfiles);
    expect(mockFormat).toHaveBeenCalledTimes(2);
  });
});
