import type { SVGProps } from 'react';

export type CloseXSVGProps = SVGProps<SVGSVGElement> & {
  pathId: string;
  fill?: string;
  stroke?: string;
  size?: 'small' | 'medium' | 'large';
};

export const CloseX = ({
  pathId,
  fill,
  stroke,
  size = 'small',
}: CloseXSVGProps) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };
  return (
    <svg
      width={sizeMap[size] + 'px'}
      height={sizeMap[size] + 'px'}
      viewBox="0 0 24 24"
      fill={fill ? fill : 'none'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <g id="Menu / Close_LG">
          {' '}
          <path
            id={pathId}
            d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001"
            stroke={stroke ? stroke : '#000000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>{' '}
        </g>{' '}
      </g>
    </svg>
  );
};
