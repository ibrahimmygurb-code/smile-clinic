-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🦷',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

INSERT INTO "services" ("id", "name", "description", "duration", "price", "icon") VALUES
('checkup', 'فحص دوري', 'فحص شامل للأسنان واللثة مع تقرير عن الحالة.', 30, 150, '🔍'),
('cleaning', 'تنظيف الأسنان', 'إزالة الجير وتلميع الأسنان للحفاظ على صحة الفم.', 45, 250, '✨'),
('filling', 'حشوة أسنان', 'علاج التسوس واستبدال الجزء التالف من السن.', 60, 350, '🛠️'),
('whitening', 'تبييض الأسنان', 'جلسة تبييض آمنة لتحسين لون الأسنان.', 60, 800, '💎'),
('extraction', 'خلع ضرس', 'خلع ضرس أو سن تالف بإجراء آمن ومريح.', 45, 400, '🩺')
ON CONFLICT ("id") DO NOTHING;
