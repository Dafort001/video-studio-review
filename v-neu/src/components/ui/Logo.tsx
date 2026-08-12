import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center ${className}`} aria-label={siteConfig.brandName}>
      {showText && (
        <span className={`${textSizes[size]} font-semibold tracking-[0.08em] text-primary`}>
          {siteConfig.brandName}
        </span>
      )}
    </div>
  );
}
