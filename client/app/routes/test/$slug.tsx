import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ params }) => {
  return json({ slug: params.slug });
};

export default function FirstPost() {
  const { slug } = useLoaderData();
  return (
    <main>
      <h1>Name of post slug: {slug}</h1>
    </main>
  );
}
