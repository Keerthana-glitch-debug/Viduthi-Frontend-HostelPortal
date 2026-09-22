# Vidudhi — Hostel Management System

A hostel management frontend for tracking rooms, complaints, leave requests,
and visitors, with role-based views for residents and admins.

## What changed from the original

- **Design system** — new palette (cork parchment, brass gold, ID-card teal,
  berry-red), Space Grotesk / Inter / IBM Plex Mono type stack, and a real
  structural signature: key-fob sidebar nav that swings on hover, punched-hole
  "tag" cards, spiral-bound ledger panels, washi-tape eyebrows, and a
  laminated-ID-card login screen.
- **Redux Toolkit** — `src/store` holds one slice per domain (auth, ui, rooms,
  complaints, leave, visitors, notifications). All page components read and
  write through `useSelector` / `useDispatch` instead of prop drilling.
- **React Router v6** — real routes under `/app/*`, a `ProtectedRoute` /
  `PublicOnlyRoute` pair guarding auth, and a URL-addressable room detail
  (`/app/rooms/:roomId`) so a link can point straight at a room.
- **Eight custom hooks** — the original `useToggle`, `useLocalStorage`,
  `useFilter`, plus five new ones, each doing real work:
  - `useDebounce` — powers the top-bar quick search
  - `useMediaQuery` — auto-collapses the sidebar on narrow screens
  - `useOnClickOutside` — dismisses the search dropdown and modals
  - `useKeyPress` — `/` focuses search, `Esc` closes modals
  - `useInterval` — drives the live duty clock in the top bar

## Run it

```bash
npm install
npm run dev
```

Any credentials sign you in — pick **Resident** or **Admin / Warden** on the
login screen to see both experiences.
