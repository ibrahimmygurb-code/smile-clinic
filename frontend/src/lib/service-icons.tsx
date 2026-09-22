/** أيقونات الخدمات — إيموji بنفس أسلوب الموقع (الشعار، لماذا نحن، بطاقات الخدمات). */

export const DEFAULT_SERVICE_ICON = "🦷";

/** إيموji شائعة للعيادة — تظهر في شبكة سريعة بنفس شكل البطاقات */
export const serviceEmojiOptions = [
  "🦷",
  "🔍",
  "✨",
  "🛠️",
  "💎",
  "🩺",
  "⚙️",
  "👨‍⚕️",
  "🛋️",
  "🪥",
  "💉",
  "💊",
  "🏥",
  "❤️",
  "⭐",
  "🌟",
  "😁",
  "🧑‍⚕️",
  "🔬",
  "📅",
  "⏱️",
  "💰",
  "🎁",
  "☀️",
  "🛡️",
  "📋",
  "👁️",
  "🔥",
  "💡",
  "🎯",
  "✅",
  "📞",
] as const;

const legacyHeroToEmoji: Record<string, string> = {
  sparkles: "✨",
  "magnifying-glass": "🔍",
  heart: "❤️",
  "face-smile": "😁",
  star: "⭐",
  sun: "☀️",
  "shield-check": "🛡️",
  "check-badge": "✅",
  eye: "👁️",
  beaker: "🔬",
  "wrench-screwdriver": "🛠️",
  "cog-6-tooth": "⚙️",
  bolt: "💡",
  fire: "🔥",
  "clipboard-document-check": "📋",
  "calendar-days": "📅",
  clock: "⏱️",
  "currency-dollar": "💰",
  user: "🧑‍⚕️",
  "user-group": "👨‍⚕️",
  phone: "📞",
  "chat-bubble-left-right": "💬",
  gift: "🎁",
  "building-office-2": "🏥",
  home: "🏠",
  lifebuoy: "🛟",
  scale: "⚖️",
  "academic-cap": "🎓",
};

export function resolveServiceIcon(stored: string): string {
  const trimmed = stored.trim();
  if (!trimmed) {
    return DEFAULT_SERVICE_ICON;
  }
  return legacyHeroToEmoji[trimmed] ?? trimmed;
}

const badgeSizeClass = {
  sm: "h-9 w-9 text-lg",
  md: "h-10 w-10 text-xl",
  lg: "h-12 w-12 text-xl",
} as const;

type ServiceIconProps = {
  icon: string;
  size?: keyof typeof badgeSizeClass;
  className?: string;
};

export function ServiceIcon({ icon, size = "lg", className = "" }: ServiceIconProps) {
  const emoji = resolveServiceIcon(icon);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-accent-soft leading-none ${badgeSizeClass[size]} ${className}`}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
