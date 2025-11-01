import { cva, type VariantProps } from "class-variance-authority";

export const card = cva(
  "rounded-lg border bg-surface text-surface-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border-muted shadow-md",
        outline: "border-2 border-border-muted bg-transparent",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type CardVariants = VariantProps<typeof card>;
