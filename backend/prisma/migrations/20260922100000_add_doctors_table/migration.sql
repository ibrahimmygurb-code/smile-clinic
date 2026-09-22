-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

INSERT INTO "doctors" ("id", "name", "specialty") VALUES
('dr-ahmed', 'د. أحمد العتيبي', 'طب أسنان عام'),
('dr-sara', 'د. سارة القحطاني', 'تجميل الأسنان'),
('dr-khalid', 'د. خالد الحربي', 'تقويم الأسنان'),
('dr-noura', 'د. نورة الزهراني', 'أسنان الأطفال')
ON CONFLICT ("id") DO NOTHING;
