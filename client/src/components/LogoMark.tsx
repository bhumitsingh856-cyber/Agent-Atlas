export default function LogoMark() {
  return (
    <svg
      width='400'
      height="400"
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="30" r="4" />
        <circle cx="40" cy="15" r="4" />
        <circle cx="40" cy="45" r="4" />
        <circle cx="60" cy="30" r="4" />
        <line x1="20" y1="30" x2="40" y2="15" />
        <line x1="20" y1="30" x2="40" y2="45" />
        <line x1="40" y1="15" x2="60" y2="30" />
        <line x1="40" y1="45" x2="60" y2="30" />
      </g>
    </svg>
  );
}