import { CreateAccount } from '../../../prisma/mutations/accountMutations';
import { prismaMock } from '../../../utilities/prismaClientSingleton';

// TODO look into why this prisma unit test, is somehow hitting the graphql resolver
// which then fails because that file has a bunch of dependencies that are not mocked
// however, this should just be testing the prisma client and methods, shouldn't need the resolver or graphql at all
// NOTE not sure if this test actually passes or not yet
describe.skip('accountMutations', () => {
  describe.skip('CreateAccount', () => {
    it.skip('should create an account', async () => {
      const account = {
        id: 1,
        email: 'test@mail.com',
        email_verified: true,
        created_at: new Date().toISOString(),
        deactivated: false,
        deactivated_at: '',
        phone_number: '',
      };
      // @ts-ignore
      prismaMock.account.create.mockResolvedValue(account);

      await expect(
        CreateAccount(account.email, account.email_verified)
      ).resolves.toEqual({
        id: 1,
        email: 'test@mail.com',
        email_verified: true,
        created_at: new Date().toISOString(),
        deactivated: false,
        deactivated_at: '',
        phone_number: '',
      });
    });
  });
});
