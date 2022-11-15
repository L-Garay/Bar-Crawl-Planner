import { Link } from '@remix-run/react';

export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        lineHeight: '1.4',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1>Welcome to Remix</h1>
      <Link to="/test">Test Link</Link>
      <Link to="/test">Login</Link>
    </div>
  );
}
