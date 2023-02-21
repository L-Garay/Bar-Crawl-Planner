import sleep from './sleepFunction';

jest.useFakeTimers();

describe('Custom sleep function', () => {
  it('should sleep for 1 seconds', async () => {
    jest.spyOn(global, 'setTimeout');
    await sleep(1000);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });
  // NOTE since this test is async and waits for the specific time to pass, one test should be sufficient otherwise the time to run will be longer than necessary
});

jest.useRealTimers();
