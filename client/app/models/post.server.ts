type Post = {
  slug: string;
  title: string;
};

export async function getPosts(): Promise<Array<Post>> {
  return [
    {
      slug: 'my-first-post',
      title: 'My First Post',
    },
    {
      slug: 'second-post',
      title: 'This is the second post',
    },
  ];
}
