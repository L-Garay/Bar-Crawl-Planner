import React from 'react';
import { BasicFooter } from '~/components/organisms/Footers';

// NOTE figure out how to implement this layout
export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BasicFooter />
    </>
  );
}
