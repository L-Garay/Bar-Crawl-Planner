import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getPosts } from '~/models/post.server';

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({ posts: await getPosts() });
};

export default function Posts() {
  const { posts } = useLoaderData() as LoaderData;
  console.log(posts);

  return (
    <main>
      <h1>Test Page</h1>
      <div>
        <Link to="/async">Here is a link to an asynchronous page.</Link>
      </div>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={post.slug} className="text-blue-600 underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}