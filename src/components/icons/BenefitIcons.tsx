import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v4.5l3 2" />
      <path d="M12 3.5v1.2M12 19.3v1.2M3.5 12h1.2M19.3 12h1.2" strokeWidth={1.25} opacity={0.5} />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7.5h12a2 2 0 0 1 2 2v7a1.5 1.5 0 0 1-1.5 1.5H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      <path d="M4.5 10.5h13.5" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <path d="M7 6.5V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v.5" />
    </svg>
  );
}

export function FamilyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16.5" cy="9" r="2" />
      <path d="M4.5 18.5c.8-2.8 2.8-4 4.5-4s3.7 1.2 4.5 4" />
      <path d="M13.5 18.5c.5-2 1.8-3 3-3s2.5 1 3 3" />
      <circle cx="6.5" cy="10.5" r="1.75" opacity={0.55} />
      <path d="M3.5 18.5c.5-1.8 1.6-2.7 3-2.7" opacity={0.55} />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 5.5h1.8l1.6 8.2a1.5 1.5 0 0 0 1.5 1.2h5.4a1.5 1.5 0 0 0 1.45-1.1l1.2-4.3H8.2" />
      <circle cx="10.5" cy="18.5" r="1.25" />
      <circle cx="16" cy="18.5" r="1.25" />
      <path d="M5 5.5 4 3.5h-2" />
    </svg>
  );
}

export function MealPrepIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="9" width="15" height="9.5" rx="2" />
      <path d="M8 9V7.5a4 4 0 0 1 8 0V9" />
      <path d="M9 13h6M9 15.5h4" strokeWidth={1.5} />
      <path d="M12 4.5v1" opacity={0.45} />
    </svg>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9.5" y="4" width="5" height="9" rx="2.5" />
      <path d="M7 11.5a5 5 0 0 0 10 0" />
      <path d="M12 16.5v3M9.5 19.5h5" />
      <path d="M10.5 7.5a1.5 1.5 0 0 1 3 0v2a1.5 1.5 0 0 1-3 0v-2Z" fill="currentColor" stroke="none" opacity={0.25} />
    </svg>
  );
}

export type BenefitIconId =
  | "time"
  | "budget"
  | "family"
  | "cart"
  | "prep"
  | "voice";

const ICON_MAP: Record<BenefitIconId, typeof ClockIcon> = {
  time: ClockIcon,
  budget: WalletIcon,
  family: FamilyIcon,
  cart: CartIcon,
  prep: MealPrepIcon,
  voice: MicIcon,
};

const ACCENT_STYLES: Record<
  BenefitIconId,
  { bg: string; ring: string; icon: string }
> = {
  time: {
    bg: "from-sky-100 via-sky-50 to-white",
    ring: "ring-sky-200/80",
    icon: "text-sky-700",
  },
  budget: {
    bg: "from-emerald-100 via-emerald-50 to-white",
    ring: "ring-emerald-200/80",
    icon: "text-emerald-700",
  },
  family: {
    bg: "from-orange-100 via-amber-50 to-white",
    ring: "ring-orange-200/80",
    icon: "text-orange-700",
  },
  cart: {
    bg: "from-violet-100 via-violet-50 to-white",
    ring: "ring-violet-200/80",
    icon: "text-violet-700",
  },
  prep: {
    bg: "from-rose-100 via-rose-50 to-white",
    ring: "ring-rose-200/80",
    icon: "text-rose-700",
  },
  voice: {
    bg: "from-pink-100 via-pink-50 to-white",
    ring: "ring-pink-200/80",
    icon: "text-pink-700",
  },
};

interface BenefitIconBadgeProps {
  id: BenefitIconId;
  className?: string;
}

export function BenefitIconBadge({ id, className = "" }: BenefitIconBadgeProps) {
  const Icon = ICON_MAP[id];
  const accent = ACCENT_STYLES[id];

  return (
    <div
      className={[
        "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1",
        accent.bg,
        accent.ring,
        className,
      ].join(" ")}
      aria-hidden
    >
      <Icon className={["h-6 w-6", accent.icon].join(" ")} />
    </div>
  );
}
