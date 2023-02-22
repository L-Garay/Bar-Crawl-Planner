import React from 'react';
import { LandingPageFooter } from '~/components/organisms/Footers';

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LandingPageFooter />
    </>
  );
}
