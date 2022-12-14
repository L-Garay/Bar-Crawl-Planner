import type { LinksFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { BasicFooter } from '~/components/organisms/Footers';
import { BasicHeader } from '~/components/organisms/Headers';
import footerStyles from '~/generatedStyles/footer.css';
import headerStyles from '~/generatedStyles/header.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: headerStyles,
    },
    {
      rel: 'stylesheet',
      href: footerStyles,
    },
  ];
};

// NOTE I'm thinking we use this component/file to handle the logic of determining which combination of header/footer to use
// I.e. if the user is logged in, we use the standard header/footer, if they're not, we use the 'logged' out version of the header
// and there may be some pages where we don't want one or the other, so we can use a 'no header' or 'no footer' layout
export default function StandardLayout() {
  return (
    <>
      <BasicHeader />
      <Outlet />
      <BasicFooter />
    </>
  );
}
