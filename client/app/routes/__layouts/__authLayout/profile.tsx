export default function ProfileIndex() {
  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Profile page</h1>
        <p>
          This will be where users can add/update their profile picture
          (thinking if we'll need to screen/filter out bad ones)
        </p>
        <p>
          OR maybe we can just have them choose an 'avatar', which could be an
          icon/svg (maybe animated), or something predetermined{' '}
        </p>
        <p>This page could also be where users can set certain preferences</p>
        <p>
          I'm thinking things like: light/dark mode of site, who can/can't send
          friend requests, and more when I think of them haha
        </p>
        <p>
          Obviously they'll be able to update any other profile information if
          needed
        </p>
        <p>
          As far as design, again I'm not too sure how I want this to look. But
          I figure it's 'okay' for it to be more basic, but it'd be nice if it
          looked cool
        </p>
      </div>
    </>
  );
}
