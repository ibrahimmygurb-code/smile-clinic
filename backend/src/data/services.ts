export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
};

export const defaultServices: Service[] = [
  {
    id: "checkup",
    name: "فحص دوري",
    description: "فحص شامل للأسنان واللثة مع تقرير عن الحالة.",
    duration: 30,
    price: 150,
    icon: "🔍",
  },
  {
    id: "cleaning",
    name: "تنظيف الأسنان",
    description: "إزالة الجير وتلميع الأسنان للحفاظ على صحة الفم.",
    duration: 45,
    price: 250,
    icon: "✨",
  },
  {
    id: "filling",
    name: "حشوة أسنان",
    description: "علاج التسوس واستبدال الجزء التالف من السن.",
    duration: 60,
    price: 350,
    icon: "🛠️",
  },
  {
    id: "whitening",
    name: "تبييض الأسنان",
    description: "جلسة تبييض آمنة لتحسين لون الأسنان.",
    duration: 60,
    price: 800,
    icon: "💎",
  },
  {
    id: "extraction",
    name: "خلع ضرس",
    description: "خلع ضرس أو سن تالف بإجراء آمن ومريح.",
    duration: 45,
    price: 400,
    icon: "🩺",
  },
];

export const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];
