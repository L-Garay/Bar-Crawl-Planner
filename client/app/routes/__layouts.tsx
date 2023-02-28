import { Outlet } from '@remix-run/react';

// TODO put non-logged in header and footer here
export default function StandardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
