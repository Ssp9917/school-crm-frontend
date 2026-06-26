interface BadgeCheckProps {
  size?:     number;
  verified?: boolean;
}

const BadgeCheck = ({ size = 16, verified = false }: BadgeCheckProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      fill={verified ? 'var(--accent)' : '#6b7280'}
      stroke="none"
    />
    <path
      d="m9 12 2 2 4-4"
      fill="none"
      stroke="var(--content-bg, #1c1c1c)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BadgeCheck;
