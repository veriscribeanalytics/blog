/**
 * Renders a headline with one substring set in Playfair italic.
 * Falls back to the plain title when `accent` is absent or not found,
 * so bad data degrades to normal text rather than breaking the headline.
 */
export default function AccentTitle({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  const at = accent ? title.indexOf(accent) : -1;

  if (at === -1) return <>{title}</>;

  return (
    <>
      {title.slice(0, at)}
      <em className="headline-accent">{accent}</em>
      {title.slice(at + accent!.length)}
    </>
  );
}
