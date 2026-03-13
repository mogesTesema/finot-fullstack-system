const SkeletonLoader = ({ className = "", lines = 3 }: { className?: string; lines?: number }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded-lg"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`card animate-fadeIn ${className}`}>
    <div className="skeleton h-5 w-2/3 mb-4 rounded-lg" />
    <div className="space-y-2">
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-4/5 rounded-lg" />
      <div className="skeleton h-3 w-3/5 rounded-lg" />
    </div>
  </div>
);

export const SkeletonAvatar = ({ size = "h-12 w-12" }: { size?: string }) => (
  <div className={`skeleton rounded-full ${size}`} />
);

export default SkeletonLoader;