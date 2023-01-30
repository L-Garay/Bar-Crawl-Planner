import Bull from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const testQueue = new Bull('test overnight queue', {
  redis: {
    host: process.env.REDIS_HOSTNAME,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_HOST_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});

testQueue.process(
  'quick sanity test before overnight job',
  async (job, done) => {
    job.progress(50);
    job.progress(75);
    done(null, { message: job.data.message, id: job.id });
  }
);
testQueue.process('test overnight job', async (job, done) => {
  job.progress(50);
  job.progress(75);
  done(null, { message: job.data.message, id: job.id });
});

testQueue.on('completed', (job, result) => {
  console.log('job completed', result);
});

testQueue.on('progress', (job, progress) => {
  console.log('Progress is:', progress);
});

export const testJob = async () => {
  await testQueue.add('quick sanity test before overnight job', {
    message: 'this job should be processed immediately',
  });
  await testQueue.add(
    'test overnight job',
    {
      message: 'this job should be processed at 1am on Tue Jan 31st',
    },
    { attempts: 3, backoff: 1000, repeat: { cron: '0 1 * * *' } }
  );
};
