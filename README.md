# عيادة ابتسامة

المشروع مقسوم إلى جزئين منفصلين:

```
next.wep/
├── frontend/    الواجهة (Next.js)     http://localhost:3000
└── backend/     الـ API + PostgreSQL  http://localhost:4000
```

## التشغيل

من جذر المشروع:

```bash
npm run dev
```

هذا الأمر يشغّل الباك اند والفرونت اند معاً.

- الموقع: http://localhost:3000
- فحص الـ API: http://localhost:4000/api/health

## أوامر مفيدة

```bash
npm run dev:backend
npm run dev:frontend
npm run db:studio
```
