/**
 * High-performance skeleton loading indicator.
 * Uses pure CSS shimmer animation instead of Framer Motion
 * to minimize JS overhead when many skeletons render simultaneously.
 */
export default function Skeleton({ className = "" }) {
  return (
    <div className={`skeleton-shimmer rounded-md ${className}`} />
  );
}
