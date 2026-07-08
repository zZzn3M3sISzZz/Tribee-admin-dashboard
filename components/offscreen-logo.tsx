import Image from "next/image";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

type OffscreenLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function OffscreenLogo({ size = 36, className, priority }: OffscreenLogoProps) {
  return (
    <Image
      src={withBasePath("/offscreen-logo.png")}
      alt="offScreen"
      width={size}
      height={size}
      priority={priority}
      className={cn("h-auto w-auto brightness-0", className)}
      style={{ width: size, height: size }}
    />
  );
}
