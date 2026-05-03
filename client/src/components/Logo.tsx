import logoBlack from "@/assets/brand/lab909-logo-black.png";
import logoWhite from "@/assets/brand/lab909-logo-white.png";

type Props = {
  variant?: "white" | "black";
  className?: string;
  testid?: string;
};

export function Logo({ variant = "white", className = "h-7 w-auto", testid }: Props) {
  const src = variant === "white" ? logoWhite : logoBlack;
  return (
    <img
      src={src}
      alt="The LAB 909"
      className={className}
      draggable={false}
      data-testid={testid}
    />
  );
}
