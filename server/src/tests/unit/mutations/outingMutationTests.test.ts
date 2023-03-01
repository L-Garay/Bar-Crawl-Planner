import { CreateOuting } from '../../../prisma/mutations/outingMutations';
import { prismaMock } from '../../../utilities/prismaClientSingleton';

// TODO look into why this prisma unit test, is somehow hitting the graphql resolver
// which then fails because that file has a bunch of dependencies that are not mocked
// however, this should just be testing the prisma client and methods, shouldn't need the resolver or graphql at all
// NOTE not sure if this test actually passes or not yet
describe('outing mutations', () => {
  describe('CreateOuting', () => {
    it('should create an outing', async () => {
      const outing = {
        id: 1,
        name: 'Bob',
        start_date_and_time: '12/12/2020',
        created_at: '12/30/2020',
        place_ids: ['123', '456'],
        creator_profile_id: 1,
      };
      // @ts-ignore
      prismaMock.outing.create.mockResolvedValue(outing);

      await expect(CreateOuting(outing)).resolves.toEqual({
        id: 1,
        name: 'Bob',
        creator_profile_id: 1,
        created_at: '12/30/2020',
        start_date_and_time: '12/12/2020',
        place_ids: ['123', '456'],
      });
    });
  });
});
