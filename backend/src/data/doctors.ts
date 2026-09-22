export type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

export const defaultDoctors: Doctor[] = [
  {
    id: "dr-ahmed",
    name: "د. أحمد العتيبي",
    specialty: "طب أسنان عام",
  },
  {
    id: "dr-sara",
    name: "د. سارة القحطاني",
    specialty: "تجميل الأسنان",
  },
  {
    id: "dr-khalid",
    name: "د. خالد الحربي",
    specialty: "تقويم الأسنان",
  },
  {
    id: "dr-noura",
    name: "د. نورة الزهراني",
    specialty: "أسنان الأطفال",
  },
];
