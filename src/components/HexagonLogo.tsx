// HexagonLogo.tsx
interface HexagonLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<HexagonLogoProps["size"]>, string> = {
  sm: "h-14 w-auto",   // bigger than before
  md: "h-18 w-auto",
  lg: "h-24 w-auto",   // big for navbar
};

const HexagonLogo = ({ size = "lg", className = "" }: HexagonLogoProps) => {
  const sizeClass = sizeClasses[size];

  return (
    <img
      src="/sia-logo.png"  // or .jpg if that's your file
      alt="SIA Hexagon Logo"
      className={`${sizeClass} ${className}`}
    />
  );
};

export default HexagonLogo;
