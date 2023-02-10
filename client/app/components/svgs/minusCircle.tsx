import type { SVGProps } from 'react';

export type MinusCircleSVGProps = SVGProps<SVGSVGElement> & {
  pathId: string;
  fill?: string;
  stroke?: string;
};

export const MinusCircle = ({ pathId, fill, stroke }: MinusCircleSVGProps) => {
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill={fill ? fill : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke ? stroke : '#f08080'}
      // strokeWidth="0.975"
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
          d="M11.92 22C17.42 22 21.92 17.5 21.92 12C21.92 6.5 17.42 2 11.92 2C6.41998 2 1.91998 6.5 1.91998 12C1.91998 17.5 6.41998 22 11.92 22Z"
          stroke={stroke ? stroke : '#f08080'}
          strokeWidth="1.56"
          strokeLinecap="round"
          strokeLinejoin="round"
          id={pathId}
        />{' '}
        <path
          d="M7.91998 12H15.92"
          stroke={stroke ? stroke : '#f08080'}
          strokeWidth="1.56"
          strokeLinecap="round"
          strokeLinejoin="round"
        />{' '}
      </g>
    </svg>
  );
};

export default MinusCircle;
