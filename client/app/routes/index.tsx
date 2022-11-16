import { Link } from '@remix-run/react';
import useAuthContext from '~/auth/authContext';

export default function LandingPage() {
  const { authClient } = useAuthContext();
  console.log(authClient);

  // const attemptLogin = async () => {

  // }

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
      {/* <button onClick={() => {}}>Login</button> */}
    </div>
  );
}
