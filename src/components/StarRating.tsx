import { Star, StarHalf } from "./icons";

export default function StarRating({
  rating,
  reviews,
}: {
  rating: number;
  reviews?: string;
}) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5 text-star">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={13} />
        ))}
        {half === 1 && <StarHalf size={13} />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={13} fill="none" className="stroke-star" />
        ))}
      </span>
      <span className="text-[12.5px] font-semibold text-ink">{rating}</span>
      {reviews && (
        <span className="text-[11.5px] text-muted">({reviews})</span>
      )}
    </span>
  );
}
