export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 9c-3-2.2-7-2.6-11-1.6v16c4-1 8-.6 11 1.6 3-2.2 7-2.6 11-1.6v-16c-4-1-8-.6-11 1.6Z" fill="var(--sage-soft)" stroke="var(--sage-deep)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 9v16" stroke="var(--sage-deep)" strokeWidth="1.4" />
      <path d="M21 5.5c1.6 1 2.4 2.6 2 4.4-1.8-.2-3-1.4-3.4-3" stroke="var(--rose)" strokeWidth="1.3" strokeLinecap="round" fill="var(--rose-soft)" />
    </svg>
  );
}
