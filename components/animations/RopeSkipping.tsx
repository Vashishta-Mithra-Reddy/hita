import Rive from '@rive-app/react-canvas';
import { cn } from "@/lib/utils";

interface RopeSkippingProps {
  className?: string;
}

export const RopeSkipping = ({ className }: RopeSkippingProps) => (
  <div className={cn("w-full h-[400px]", className)}>
    <Rive
      className="w-full h-full bg-background"
      src="/animations/rope-skipping.riv"
    />
  </div>
);