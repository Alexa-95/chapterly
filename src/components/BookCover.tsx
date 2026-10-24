/* eslint-disable @next/next/no-img-element */
type Props = { title: string; thumbnail: string | null; size?: "sm" | "md" | "lg" };

const TINTS = ["#e7efe6", "#f3e6e4", "#ece8f3", "#f4ecdc", "#e3edf1"];

export default function BookCover({ title, thumbnail, size = "md" }: Props) {
  if (thumbnail) {
    return <img src={thumbnail} alt={`Cover: ${title}`} className={`cover cover-${size}`} loading="lazy" />;
  }
  const tint = TINTS[title.length % TINTS.length];
  return (
    <div className={`cover cover-${size} cover-empty`} style={{ background: tint }} aria-label={title}>
      <span>{title}</span>
    </div>
  );
}
