import type { SVGProps } from 'react';

export type PlusCircleSVGProps = SVGProps<SVGSVGElement> & {
  pathId: string;
  fill?: string;
  stroke?: string;
};

export const PlusCircle = ({ pathId, fill, stroke }: PlusCircleSVGProps) => {
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 15.00 15.00"
      fill={fill ? fill : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke ? stroke : '#20b2aa'}
      strokeWidth="0.975"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        {' '}
        <path
          d="M7.5 4V11M4 7.5H11M7.5 14.5C3.63401 14.5 0.5 11.366 0.5 7.5C0.5 3.63401 3.63401 0.5 7.5 0.5C11.366 0.5 14.5 3.63401 14.5 7.5C14.5 11.366 11.366 14.5 7.5 14.5Z"
          stroke={stroke ? stroke : '#20b2aa'}
          id={pathId}
        />{' '}
      </g>
    </svg>
  );
};

export default PlusCircle;
