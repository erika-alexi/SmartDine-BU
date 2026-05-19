# Final Prototype - SmartDine BU

SmartDine BU is a web-based canteen ordering and queue management prototype for the Bicol University Polangui community. It supports student/faculty ordering, menu browsing, cart checkout, COD and GCash proof-of-payment flow, pickup scheduling, queue/status tracking, admin order management, allergen guidance, and a floating NLP chatbot.

The interface is now refined for both desktop and mobile views. Desktop keeps the wider dashboard/card layouts, while mobile uses a compact header menu, responsive grids, full-width action buttons where needed, scroll-safe modals, mobile-friendly notifications, and a phone-sized chatbot panel.

Figma UI reference: https://www.figma.com/design/4nGS6lKL64LGvrdmr5dnVu/Final-Prototype---SmartDine-BU

## Tools and Deployment

- Frontend: React, HTML, CSS, Tailwind CSS, JavaScript/TypeScript
- Runtime/build tool: Node.js with Vite
- Hosting target: Vercel
- Database/backend service: Supabase PostgreSQL
- NLP: local JavaScript/TypeScript NLP module with browser Web Speech API for voice-to-text and text-to-speech
- Design/source workflow: Figma, VS Code, GitHub, and Vercel
- Responsive support: smartphones, tablets, laptops, and desktop screens

See `SYSTEM_REQUIREMENTS_ALIGNMENT.md` for the Chapter 1-3 tools, software, hardware, and requirement mapping.

## Supabase Setup

The deployed app reads menu data, auth sessions, orders, profiles, and NLP chat history from Supabase when these environment variables are set in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use `database/smartdine_supabase_schema.sql` in the Supabase SQL Editor to create or update the project tables, Row Level Security policies, Auth profile trigger, NLP chat-history table, and starter menu data.

Admin users are not self-registered as admins. Create/register the admin account first, then run:

```sql
update public.profiles
set role = 'admin'
where email = 'eamm2023-3931-34889@bicol-u.edu.ph';
```

Repeat the same SQL for other approved admin BU emails.

The admin login page is available at `/admin/login`.

Do not commit database passwords or service-role keys. The anon/publishable key can be used by the frontend when Row Level Security policies are enabled.

## Source Code Map

- App shell, responsive desktop/mobile header, notification entry points: `src/app/components/RootLayout.tsx`
- Mobile-friendly notification panel: `src/app/components/NotificationPanel.tsx`
- Mobile-friendly floating chatbot UI, voice input, Speak button, NLP details toggle: `src/app/components/ChatBot.tsx`
- Home page responsive hero, specials, and feature sections: `src/app/pages/HomePage.tsx`
- Menu/allergen indicators/add-ons and responsive add-on modal: `src/app/pages/MenuPage.tsx`
- Cart responsive item cards and order summary: `src/app/pages/CartPage.tsx`
- Checkout, ASAP fee, pickup validation, responsive forms: `src/app/pages/CheckoutPage.tsx`, `src/app/utils/pickup.ts`
- Payment confirmation and responsive GCash proof upload: `src/app/pages/PaymentPage.tsx`
- Order tracking and status progress: `src/app/pages/OrderStatusPage.tsx`
- Admin dashboard/order management/menu management: `src/app/pages/AdminDashboardPage.tsx`, `src/app/pages/OrderManagementPage.tsx`, `src/app/pages/MenuManagementPage.tsx`
- Registration/login/admin role handling: `src/app/contexts/AuthContext.tsx`
- Menu data, categories, add-ons, and allergen fields: `src/app/data/menuData.ts`
- Cart add-ons and live menu loading: `src/app/contexts/CartContext.tsx`
- NLP logic: `src/app/utils/nlp.ts`
- Supabase client setup: `src/app/lib/supabase.ts`
- Order saving/fetching with Supabase: `src/app/services/orderService.ts`
- Database schema/RLS/admin setup: `database/smartdine_supabase_schema.sql`
- Tests: `src/test/nlp.test.ts`, `src/test/pickup.test.ts`, `src/test/login.test.tsx`

## Running the Code

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test -- --run
```

Build for production:

```bash
npm run build
```

## GitHub Upload

Use these commands from the project root when committing the source code to GitHub.

1. Open the repository folder:

```bash
cd path/to/your/existing/github/repo
```

2. Make sure the project root contains files and folders like `package.json`, `src`, `database`, and `README.md`.

3. Check what changed:

```bash
git status
```

4. Stage the project files:

```bash
git add .
```

5. Commit:

```bash
git commit -m "Update SmartDine BU responsive compatibility and documentation"
```

6. Push to GitHub:

```bash
git push origin main
```

If your branch is named `master`, use:

```bash
git push origin master
```

If GitHub rejects the push because your local branch is behind, run `git pull --rebase origin main`, resolve any conflicts, then push again.
