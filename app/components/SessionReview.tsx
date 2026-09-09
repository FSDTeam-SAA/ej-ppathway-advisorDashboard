import type { SessionDoc } from "../lib/types";

type ReviewSession = Pick<SessionDoc, "review" | "rating">;

export function getSessionReview(session: ReviewSession) {
  const review = session.review;
  const objectReview = review && typeof review === "object" ? review : null;
  const rawComment = objectReview?.comment ?? (typeof review === "string" && !/^[a-f\d]{24}$/i.test(review) ? review : "");
  const comment = typeof rawComment === "string" ? rawComment : "";
  const validRating = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5;
  const rating = validRating(objectReview?.rating) ? objectReview.rating : validRating(session.rating) ? session.rating : null;
  return {
    comment,
    ratingLabel: rating === null ? "Not rated" : `${rating.toFixed(1)} / 5`,
    hasReview: Boolean(review || rating !== null),
  };
}

export function SessionReview({ session }: { session: ReviewSession }) {
  const { comment, ratingLabel, hasReview } = getSessionReview(session);
  if (!hasReview) return null;
  return (
    <div className="mt-6 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-slate-500 mb-1">Client Review</div>
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {comment.trim() ? comment : "No written review submitted"}
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-900">{ratingLabel}</div>
      </div>
    </div>
  );
}
