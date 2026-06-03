# יוצר אלבומים | Album Maker Pro

מערכת מקצועית ליצירת אלבומי תמונות באיכות מקצועית.

A professional photo album creation platform with admin and client portals.

---

## תכונות עיקריות | Key Features

### פורטל מנהל | Admin Portal
- לוח בקרה עם סטטיסטיקות
- ניהול לקוחות ופרויקטים
- ניהול נכסי עיצוב (תבניות, רקעים, קליפארט)
- סקירה ואישור אלבומים

### פורטל לקוח | Client Portal
- רשימת פרויקטים
- עורך אלבומים מתקדם עם Canvas
- תצוגת פריסה כפולה (Double Spread)
- הגשה לאישור

### עורך האלבום | Album Editor
- גרירה ושחרור תמונות
- הוספת טקסט
- רקעים וקליפארט
- ניווט בין פריסות
- שמירה אוטומטית

---

## התחלה מהירה | Quick Start

### יצירת משתמש מנהל | Create Admin User

כדי ליצור משתמש מנהל, הרץ את השאילתה הבאה ב-SQL Editor של Cloud Backend:

To create an admin user, run this query in the Cloud Backend SQL Editor:

```sql
-- First, create the user via Supabase Auth (Dashboard > Authentication > Users > Add User)
-- Then update their profile to admin role:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### זרימת עבודה | Workflow

1. **מנהל** יוצר חשבון לקוח
2. **מנהל** יוצר פרויקט ושולח קישור
3. **לקוח** מתחבר ומעצב את האלבום
4. **לקוח** שולח לאישור
5. **מנהל** סוקר, מאשר או מבקש שינויים
6. **מנהל** מוריד PDF להדפסה

---

## נתיבים | Routes

| נתיב | תיאור |
|------|------|
| `/login` | דף התחברות |
| `/admin` | לוח בקרה למנהל |
| `/admin/clients` | ניהול לקוחות |
| `/admin/assets` | ניהול נכסי עיצוב |
| `/admin/reviews` | סקירת אלבומים |
| `/admin/settings` | הגדרות |
| `/projects` | רשימת פרויקטים ללקוח |
| `/editor/:id` | עורך אלבומים |

---

## טכנולוגיות | Technologies

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Konva.js** - Canvas editing
- **Framer Motion** - Animations
- **Supabase** - Database & Auth

---

## שפות | Languages

- עברית (RTL) - ברירת מחדל
- English (LTR) - אופציה משנית

---

## מפרט אלבום | Album Specs

- **גודל פריסה**: 42×30 ס"מ (שתי עמודים 21×30)
- **רזולוציה**: 300 DPI
- **פורמט ייצוא**: PDF להדפסה

---

© 2025 Album Maker Pro
