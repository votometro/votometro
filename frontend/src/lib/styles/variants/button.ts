import { cva, type VariantProps } from "class-variance-authority";

export const button = cva(
  // Base styles - common to all button variants
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all hover:opacity-80 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Default: Background with subtle border
        default: "bg-surface text-foreground border border-border",
        // Selected: Primary brand color
        selected: "bg-primary text-primary-foreground font-bold border border-primary",
        // Primary: Same as selected (alias for semantic clarity)
        primary: "bg-primary text-primary-foreground font-bold border border-primary",
        // Ghost: Transparent with hover effect
        ghost: "bg-transparent hover:text-foreground-secondary border-none",
        // Outline Ghost: Transparent with subtle border and hover background
        "outline-ghost": "bg-transparent hover:bg-surface border border-transparent",
      },
      size: {
        default: "py-4 px-6",
        sm: "py-2 px-4 text-sm",
        lg: "py-5 px-8 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-full md:w-auto md:flex-shrink-0",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof button>;
