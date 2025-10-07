import React from "react";

const RatingStars = ({ 
  value, 
  onChange, 
  readOnly = false, 
  className, 
  size = 20, 
  ...rest 
}) => {
  const [hoverVal, setHoverVal] = React.useState(null);
  const interactive = !readOnly && typeof onChange === "function";
  const displayVal = hoverVal ?? value;
  const starIds = [1, 2, 3, 4, 5];

  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange?.(Math.min(5, Math.round(value + 1)));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange?.(Math.max(1, Math.round(value - 1)));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange?.(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange?.(5);
    }
  };

  const StarIcon = ({ className, size = 20 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .587l3.668 7.431 8.205 1.193-5.936 5.787 1.402 8.168L12 18.897l-7.339 3.869 1.402-8.168L.127 9.211l8.205-1.193L12 .587z" />
    </svg>
  );

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={rest["aria-label"] ?? (interactive ? "Set rating" : "Rating")}
      aria-valuemin={interactive ? 1 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
      aria-valuenow={interactive ? Math.round(value) : undefined}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={onKeyDown}
    >
      {starIds.map((star) => {
        const filled = Math.max(0, Math.min(1, displayVal - (star - 1)));
        const percent = Math.round(filled * 100);

        if (!interactive) {
          return (
            <span key={star} className="relative inline-block" aria-hidden="true">
              <StarIcon size={size} className="text-gray-300" />
              <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${percent}%`, height: size }}>
                <StarIcon size={size} className="text-yellow-400" />
              </span>
            </span>
          );
        }

        const checked = Math.round(value) === star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={checked}
            className={`group relative inline-flex appearance-none p-0.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              (hoverVal ?? value) >= star ? "text-yellow-400" : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverVal(star)}
            onMouseLeave={() => setHoverVal(null)}
            onFocus={() => setHoverVal(star)}
            onBlur={() => setHoverVal(null)}
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
          >
            <StarIcon
              size={size}
              className="transition-colors"
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;