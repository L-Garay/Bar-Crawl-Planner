import { Link } from '@remix-run/react';

type SimpleNavProps = {
  links: Array<{ name: string; path: string }>;
};

export default function SimpleNav({ links }: SimpleNavProps) {
  return (
    <nav>
      {links.map((link) => {
        return (
          <Link to={link.path} key={link.path} style={{ paddingRight: 10 }}>
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
