import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import getConfig from '~/utils/config.server';
import outingsStyles from '~/generatedStyles/outingspage.css';
import { Outlet } from '@remix-run/react';
import SimpleNav from '~/components/molecules/simpleNav';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: outingsStyles,
      as: 'style',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  return getConfig();
};

export default function OutingsIndex() {
  // const loaderData = useLoaderData();

  const navLinks = [
    { name: 'Home', path: '/outings' },
    { name: 'Create an Outing', path: '/outings/create' },
    { name: 'My Outings', path: '/outings/my-outings' },
  ];

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the outings 'hub'</h1>
        <p>
          Here I'm thinking we can have 'tabs/windows' (or just lists) of
          different sizes
        </p>
        <p>
          The main window/tab will be the 'featured' outing, either the nearest
          time wise or deliberately pinned/favorited by user
        </p>
        <small>
          It would be cool if there was a map of the outing's route and below it
          was all the outing details
        </small>
        <p>There will also be a tab of other upcomming/planned outings</p>
        <p>There will be a tab for saved previous outings</p>
        <p>
          You can click on one of the outings directly to see the details page,
          or click on the tab itself (maybe link) to then get redirected to a
          page to see ALL past/upcomming outings
        </p>

        {/* NOTE this is where the outings <Outlet /> component will go */}
        {/* Then we will have a menu to select the different sections, the menu will be outside the outlet */}
        {/* The 'home section' will have info about outings and will display a google map with the user's nearest outing if they have one */}

        <SimpleNav links={navLinks} />
        <Outlet />

        {/* There will be a section to view user's created/joined outings */}
      </div>
    </>
  );
}
