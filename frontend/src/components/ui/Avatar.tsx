import { useState, type SyntheticEvent } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
  fallback?: string;
};

const sizeStyles: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export const Avatar = ({
  src,
  alt,
  size = "md",
  className = "",
  fallback,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = "/images/default-avatar.jpg";
  };

  const initials = fallback || getInitials(alt);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full border-2 border-accent/30 bg-gradient-to-br from-primary/20 to-accent/20
        font-semibold text-primary
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={handleError}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

type AvatarGroupProps = {
  avatars: Array<{
    src?: string | null;
    alt: string;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
};

export const AvatarGroup = ({
  avatars,
  max = 5,
  size = "md",
  className = "",
}: AvatarGroupProps) => {
  const displayedAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayedAvatars.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-card"
          style={{ zIndex: displayedAvatars.length - index }}
        >
          <Avatar src={avatar.src} alt={avatar.alt} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            flex items-center justify-center rounded-full
            border-2 border-card bg-muted font-semibold text-muted-foreground
            ring-2 ring-card
            ${sizeStyles[size]}
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
