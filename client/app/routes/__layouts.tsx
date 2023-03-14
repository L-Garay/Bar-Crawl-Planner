import { Outlet } from '@remix-run/react';
import { NotificationProvider } from '~/contexts/notificationContext';

// TODO put non-logged in header and footer here
export default function StandardLayout() {
  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
}
