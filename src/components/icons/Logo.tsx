import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 30"
      width="100"
      height="30"
      aria-label="Atmetny Logo"
      {...props}
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="PT Sans, Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="currentColor"
      >
        أتقني
      </text>
    </svg>
  );
}
