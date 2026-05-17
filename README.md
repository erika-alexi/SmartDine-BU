
  # Final Prototype - SmartDine BU

  This repository contains the source code for the SmartDine BU final prototype. The Figma link is for the UI prototype/reference only: https://www.figma.com/design/4nGS6lKL64LGvrdmr5dnVu/Final-Prototype---SmartDine-BU.

  ## Tools and Deployment

  - Frontend: React, HTML, CSS, Tailwind, JavaScript/TypeScript
  - Backend/runtime: Node.js/Vite, deployed on Vercel
  - Database/chatbot knowledge base: Supabase PostgreSQL
  - NLP: local JavaScript/TypeScript NLP module with browser Web Speech API for voice-to-text and text-to-speech
  - Design/source workflow: Figma UI prototype/reference, VS Code, and GitHub
  - Project scope: SmartDine BU canteen ordering, COD and GCash proof-of-payment flow, queue/status tracking, admin order management, allergen guidance, and NLP chatbot

  See `SYSTEM_REQUIREMENTS_ALIGNMENT.md` for the Chapter 1-3 tools, software, hardware, and requirement notes.

  ## Supabase Setup

  The deployed app reads menu data, auth sessions, and orders from Supabase when these environment variables are set in Vercel:

  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

  Use `database/smartdine_supabase_schema.sql` in the Supabase SQL Editor to create or update the project tables, RLS policies, Auth profile trigger, NLP chat-history table, and starter menu data.

  Admin users are not self-registered. Create/register the admin account first, then run:

  ```sql
  update public.profiles
  set role = 'admin'
  where email = 'eamm2023-3931-34889@bicol-u.edu.ph';
  ```

  The other admin accounts can be added by repeating the same SQL using their BU emails.

  The admin login page is available at `/admin/login`.

  Do not commit the database password or service-role key. The anon/publishable key can be used by the frontend as long as Row Level Security policies are enabled.

  ## Source Code Map

  If asked where each feature is implemented, use these files:

  - NLP logic: `src/app/utils/nlp.ts`
  - Chatbot UI, voice input, Speak button, NLP details toggle: `src/app/components/ChatBot.tsx`
  - Menu/allergen indicators/add-ons: `src/app/pages/MenuPage.tsx`, `src/app/data/menuData.ts`
  - Cart add-ons and live menu loading: `src/app/contexts/CartContext.tsx`
  - Registration/login/admin role handling: `src/app/contexts/AuthContext.tsx`
  - Admin login page: `src/app/pages/AdminLoginPage.tsx`
  - Admin dashboard/order management/menu management: `src/app/pages/AdminDashboardPage.tsx`, `src/app/pages/OrderManagementPage.tsx`, `src/app/pages/MenuManagementPage.tsx`
  - Checkout, ASAP fee, pickup validation: `src/app/pages/CheckoutPage.tsx`, `src/app/utils/pickup.ts`
  - Order saving/fetching with Supabase: `src/app/services/orderService.ts`
  - Supabase client setup: `src/app/lib/supabase.ts`
  - Database schema/RLS/admin setup: `database/smartdine_supabase_schema.sql`
  - Tests: `src/test/nlp.test.ts`, `src/test/pickup.test.ts`, `src/test/login.test.tsx`

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
