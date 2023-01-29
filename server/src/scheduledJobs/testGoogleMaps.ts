import Bull from 'bull';
import dotenv from 'dotenv';
import { Client } from '@googlemaps/google-maps-services-js';

dotenv.config();

const testGoogleQueue = new Bull('Test Google Maps Queue', {
  redis: {
    host: process.env.REDIS_HOSTNAME,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_HOST_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});

testGoogleQueue.process('test job name', async (job, done) => {
  // NOTE need to flush out schema types before actually testing this
  const googleClient = new Client({});
  job.progress(50);
  job.progress(75);
  done(null, { message: job.data.message, id: job.id });
});

testGoogleQueue.on('progress', (job, progress) => {
  console.log('Progress is:', progress);
});

testGoogleQueue.on('completed', (job, result) => {
  console.log('job completed', result);
});

export const testGoogleJob = async () => {
  // NOTE need to flush out schema types before actually testing this
  await testGoogleQueue.add(
    'test job name',
    { message: 'test job' },
    { attempts: 3, backoff: 1000, repeat: { every: 2000, limit: 2 } }
  );
};
