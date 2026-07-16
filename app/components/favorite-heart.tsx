"use client";

export function FavoriteHeart({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <span
      className={`favorite-heart ${active ? "is-active" : ""} ${className}`.trim()}
      data-favorite-heart="static"
      aria-hidden="true"
    >
      <svg
        className={`favorite-heart-icon ${active ? "is-filled" : ""}`.trim()}
        viewBox="0 0 100 100"
        focusable="false"
      >
        <path
          d="M50 88C45 82 17 60 11 44C5 27 16 14 32 14C41 14 47 19 50 27C53 19 59 14 68 14C84 14 95 27 89 44C83 60 55 82 50 88Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
