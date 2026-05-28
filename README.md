# SocietyNest

A full-stack society management platform built for real housing societies — not just as a project, but something that actually solves the daily chaos of managing flats, bills, complaints, and visitors.

**Live:** [societynest360.vercel.app](https://societynest360.vercel.app)

---

## Why I built this

Managing a housing society involves a lot of moving parts — maintenance bills, notices, complaint tracking, visitor logs, rental flats — and most societies still handle all of this through WhatsApp groups and Excel sheets. SocietyNest brings all of it into one platform with proper role-based access so every person (admin, resident, guard) sees exactly what they need to see.

---

## What it does

The platform is organized around the concept of **Societies** and **Wings**. A society can have multiple wings (Wing A, Wing B, Block 1, etc.), and each wing can have its own admin. Here's what each role can do:

**Superadmin** — full access. Creates the society, manages wings, approves members, issues bills, tracks all expenses and complaints.

**Wing Admin** — manages their own wing. Issues bills for their residents, handles complaints, posts notices.

**Resident** — pays bills online, raises complaints, views notices and announcements, lists/discovers rental flats in the society.

**Guard** — logs visitor entries and exits, views notices targeted to guards.

### Features

- **Bill Management** — Admins create bills for individual residents or bulk-issue them across a wing. Residents pay online via Razorpay or Cashfree. After payment, an email receipt goes out automatically.
- **Expense Tracking** — Society expenses are logged with categories (maintenance, utilities, security, salaries, etc.) and are visible to all members for transparency.
- **Notice Board** — Notices can be targeted — only residents, only guards, or everyone. Supports priority levels (low, medium, high) and expiry dates.
- **Announcements** — Society-wide posts for events, updates, or polls.
- **Complaint Management** — Residents raise complaints with category and priority. Admins respond and update the status. Full history is maintained.
- **Visitor Log** — Guards log visitor name, phone, purpose, which flat they're visiting, ID proof type, and vehicle number. Entry and exit times are tracked.
- **Rental Flat Management** — Flat owners can list their flats with BHK type, rent, deposit, furnishing status. Residents can browse and send interest requests.
- **Member Management** — New members who join via society code need admin approval before they get access.
- **Multi-Society Support** — A user can be part of multiple societies with different roles in each, and switch between them in one click.

---

## Tech stack

**Frontend:** React 19, Vite, React Router v7, Axios, Recharts, Lucide React, React Hot Toast, html2pdf.js

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT for auth, Bcryptjs for passwords

**Payments:** Razorpay, Cashfree, PayU

**Email:** Brevo API (switched from Gmail SMTP because Render blocks outgoing SMTP ports)

**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Project structure

```
SocietyNest/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── razorpay.js
│   │   ├── cashfree.js
│   │   └── payu.js
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── models/
│   │   ├── User.js          # User + society membership schema
│   │   ├── Society.js       # Society + bank details schema
│   │   ├── Wing.js
│   │   ├── Bill.js
│   │   ├── Announcement.js
│   │   └── others.js        # Expense, Notice, Complaint, Visitor, RentalFlat
│   ├── routes/
│   │   ├── auth.js
│   │   ├── society.js
│   │   ├── wing.js
│   │   ├── bill.js
│   │   ├── announcement.js
│   │   └── others.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── .env.example
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── sitemap.xml
    │   └── robots.txt
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Receipt.jsx
    │   │   └── ScopeBar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Auth.jsx
    │       ├── Society.jsx
    │       ├── PaymentResult.jsx
    │       └── dashboard/
    │           ├── Dashboard.jsx
    │           └── sections/
    │               ├── BillManagement.jsx
    │               ├── ExpenseManagement.jsx
    │               ├── NoticeManagement.jsx
    │               ├── AnnouncementManagement.jsx
    │               ├── ComplaintManagement.jsx
    │               ├── VisitorManagement.jsx
    │               ├── RentalManagement.jsx
    │               ├── MemberManagement.jsx
    │               └── ProfileSettings.jsx
    ├── vercel.json
    ├── vite.config.js
    └── index.html
```

---

## Roles at a glance

| Feature | Superadmin | Wing Admin | Resident | Guard |
|---|:---:|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| Approve members | ✅ | ✅ | ❌ | ❌ |
| Issue bills | ✅ | ✅ | ❌ | ❌ |
| Pay bills | ✅ | ✅ | ✅ | ❌ |
| Manage expenses | ✅ | ✅ | view only | ❌ |
| Post notices | ✅ | ✅ | ❌ | ❌ |
| View notices | ✅ | ✅ | ✅ | ✅ |
| Raise complaints | ✅ | ✅ | ✅ | ❌ |
| Resolve complaints | ✅ | ✅ | ❌ | ❌ |
| Visitor log | ✅ | ✅ | view only | ✅ |
| Rental flats | ✅ | ✅ | ✅ | ✅ |
| Announcements | ✅ | ✅ | ✅ | ✅ |

---

Built for housing societies.
