export default function ViantLogo(props) {
  return (
    <svg
      {...props}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" stroke="#ff6b6b" strokeWidth="4" fill="none" />
      <path
        d="M25 35 L50 65 L75 35"
        stroke="#ff6b6b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="50" cy="75" r="3" fill="#ff6b6b" />
    </svg>
  );
}