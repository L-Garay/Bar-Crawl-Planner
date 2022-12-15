import React from 'react';
import { BasicFooter } from '~/components/organisms/Footers';

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
