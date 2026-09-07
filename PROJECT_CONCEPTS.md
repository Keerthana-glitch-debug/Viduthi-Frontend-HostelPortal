# Vidudhi — Full Project Concept Guide

This is a walkthrough of **every technical concept used in this project**, what it
means, and the **exact file** where you can see it in action. Read this next to
the actual source code — open the file, find the line, and match it to the
explanation.

---

## 1. The Big Picture — How the app is put together

Think of the app in four layers, each with one job:

| Layer | Job | Where |
|---|---|---|
| **Data layer (Redux)** | Holds all the app's data — rooms, complaints, leave, visitors, notifications, UI preferences | `src/store/` |
| **Routing layer (React Router)** | Decides which page shows for which URL | `src/App.jsx` |
| **View layer (Components/Pages)** | Renders UI, reads data from Redux, sends actions back | `src/pages/`, `src/components/` |
| **Logic layer (Hooks)** | Reusable bits of behaviour (search debounce, click-outside, etc.) | `src/hooks/` |

Data flows in **one direction**: a component dispatches an action → Redux
updates the store → every component reading that data re-renders automatically.
This is the core idea of Redux and the reason the app never has "stale" data
between pages.

---

## 2. React fundamentals used throughout

### 2.1 Components & JSX
Every `.jsx` file exports a function that returns JSX (HTML-looking syntax
inside JavaScript). Example — `src/components/dashboard/StatCard.jsx`:
```jsx
export default function StatCard({ icon: Icon, label, value, delta, tone = 'teal' }) {
  return (
    <div className="stat-card card">
      <div className={`stat-icon tone-${tone}`}><Icon size={19} /></div>
      ...
```
- **Props**: `icon`, `label`, `value`, `delta`, `tone` are *props* — data passed
  from a parent into a child component, like function arguments.
- **Destructuring with a default**: `tone = 'teal'` means if the parent doesn't
  pass `tone`, it defaults to `'teal'`.
- **Component composition**: `StatCard` is used inside `Dashboard.jsx` four
  times with different props — that's composition, building big UIs out of
  small reusable pieces.

### 2.2 State — `useState`
Local, component-only memory. Used everywhere a form or a toggle needs to
remember something. Example — `src/pages/Login.jsx`:
```jsx
const [role, setRole] = useState('resident')
```
`role` is the current value, `setRole` is the only way to change it. Calling
`setRole('admin')` tells React "re-render this component with the new value."

### 2.3 Side effects — `useEffect`
Runs code *after* render, usually to sync with something outside React
(localStorage, timers, the DOM). Example — `src/components/layout/AppLayout.jsx`:
```jsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', isDark)
  window.localStorage.setItem('vidudhi:isDark', JSON.stringify(isDark))
}, [isDark])
```
The `[isDark]` at the end is the **dependency array** — this effect only
re-runs when `isDark` changes, not on every render.

### 2.4 Memoization — `useMemo` / `useCallback`
Both avoid redoing expensive work on every re-render.
- `useMemo` caches a **computed value**. See `src/components/layout/TopBar.jsx`:
  ```jsx
  const results = useMemo(
    () => buildResults(debouncedQuery, rooms, complaints, leaveRequests),
    [debouncedQuery, rooms, complaints, leaveRequests]
  )
  ```
  This only recalculates search results when the query or data actually changes.
- `useCallback` caches a **function** so it isn't recreated every render — used
  inside `src/hooks/useToggle.js` and `src/hooks/useTranslation.js`.

### 2.5 Refs — `useRef`
A box that holds a value *without* causing a re-render when it changes.
Used for two things here:
- **Pointing at a real DOM element**, e.g. `src/components/common/Modal.jsx`
  uses `panelRef` so `useOnClickOutside` knows which element counts as "inside."
- **Storing a value across renders** without re-rendering, e.g.
  `src/hooks/useInterval.js` stores the latest callback in a ref so the
  interval always calls the newest version.

---

## 3. Redux Toolkit — the app's shared memory

### 3.1 Why Redux instead of just `useState`?
`useState` lives inside one component. The moment a *different* component
(say, the Sidebar's notification badge) needs to know "how many notifications
are unread," you'd have to pass that state up and down through every
component in between — this is called **prop drilling**, and it gets messy
fast. Redux instead puts that value in **one central store** that any
component can read from directly, no matter how deeply nested it is.

### 3.2 The store — `src/store/store.js`
```js
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    rooms: roomsReducer,
    complaints: complaintsReducer,
    leave: leaveReducer,
    visitors: visitorsReducer,
    notifications: notificationsReducer,
  },
})
```
This combines seven independent **slices** into one big state tree. The final
shape of the store looks like:
```js
{
  auth: { isLoggedIn, role },
  ui: { isDark, sidebarCollapsed, buttonSkin, fontTheme, language, toasts },
  rooms: { list, myRoomId },
  complaints: [...],
  leave: [...],
  visitors: [...],
  notifications: [...],
}
```

### 3.3 A slice, piece by piece — `src/store/slices/complaintsSlice.js`
```js
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: initialComplaints,
  reducers: {
    addComplaint: {
      reducer: (state, action) => { state.unshift(action.payload) },
      prepare: (draft, roomNumber) => ({ payload: { id: `CMP-...`, ...draft, status: 'Open' } }),
    },
    updateComplaintStatus: (state, action) => {
      const target = state.find((c) => c.id === action.payload.id)
      if (target) target.status = action.payload.status
    },
  },
})
export const { addComplaint, updateComplaintStatus } = complaintsSlice.actions
export const selectComplaints = (state) => state.complaints
export default complaintsSlice.reducer
```
- **`createSlice`** generates three things at once: the reducer, the action
  creators, and the action types — you don't write switch-statements by hand
  like older Redux required.
- **Reducers "mutate" state directly** (`state.unshift(...)`,
  `target.status = ...`) — this looks illegal in plain JavaScript (you're
  supposed to treat state as read-only), but Redux Toolkit uses a library
  called **Immer** under the hood that turns these "mutations" into a safe,
  brand-new state object automatically. This is one of Redux Toolkit's biggest
  quality-of-life wins over old-school Redux.
- **`prepare` callback**: lets an action creator take custom arguments
  (`draft, roomNumber`) and shape them into the final `payload` before it
  reaches the reducer — see it called as `dispatch(addComplaint(draft, room.roomNumber))`
  in `src/pages/Complaints.jsx`.
- **Selectors** (`selectComplaints`): plain functions that pull a piece out of
  the store. Keeping them next to the slice means if the state shape ever
  changes, you only fix it in one place.

### 3.4 Reading from the store — `useSelector`
```jsx
const complaints = useSelector(selectComplaints)
```
This subscribes the component to that specific slice of state. If
`complaints` changes, **only** components that selected it re-render — not
the whole app. Used in every page: `Dashboard.jsx`, `Complaints.jsx`,
`LeaveRequests.jsx`, `Visitors.jsx`, `Notifications.jsx`, `RoomsPage.jsx`,
`TopBar.jsx`, `Sidebar.jsx`, `CommandPalette.jsx`.

### 3.5 Writing to the store — `useDispatch`
```jsx
const dispatch = useDispatch()
dispatch(addComplaint(draft, room.roomNumber))
```
`dispatch` sends an action to the store. Redux runs the matching reducer,
produces new state, and every subscribed component re-renders. You never
mutate the store directly from a component — you always go through an action.

### 3.6 The seven slices and what each owns

| Slice | File | Owns |
|---|---|---|
| `auth` | `authSlice.js` | Login state, role (resident/admin) |
| `ui` | `uiSlice.js` | Theme, sidebar collapse, button skin, font, language, toast queue |
| `rooms` | `roomsSlice.js` | Room list, "my room" lookup |
| `complaints` | `complaintsSlice.js` | Complaint tickets + status |
| `leave` | `leaveSlice.js` | Leave requests + approve/reject |
| `visitors` | `visitorsSlice.js` | Visitor check-in/out log |
| `notifications` | `notificationsSlice.js` | Notification list + read state |

### 3.7 The `<Provider>` — `src/main.jsx`
```jsx
<Provider store={store}>
  <BrowserRouter><App /></BrowserRouter>
</Provider>
```
`Provider` makes the store available to **every** component in the tree below
it via React Context internally — this is why any component, anywhere, can
call `useSelector`/`useDispatch` without props being passed down manually.

---

## 4. React Router v6 — turning URLs into pages

### 4.1 Route table — `src/App.jsx`
```jsx
<Routes>
  <Route path="/" element={<Navigate to="/app" replace />} />
  <Route element={<PublicOnlyRoute />}>
    <Route path="/login" element={<Login />} />
  </Route>
  <Route element={<ProtectedRoute />}>
    <Route path="/app" element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="rooms" element={<RoomsPage />} />
      <Route path="rooms/:roomId" element={<RoomsPage />} />
      <Route path="complaints" element={<Complaints />} />
      ...
    </Route>
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```
- **Nested routes**: `/app` renders `AppLayout`, and everything inside it
  (`Dashboard`, `RoomsPage`, etc.) renders **inside** `AppLayout` wherever
  `<Outlet />` is placed. This is how the sidebar + top bar stay on screen
  while only the page content changes.
- **`index` route**: the route shown when the parent path matches exactly
  (`/app` with nothing after it) → `Dashboard`.
- **Dynamic segment** `:roomId`: `/app/rooms/12` makes `roomId` available via
  `useParams()` inside `RoomsPage.jsx` — used to open a specific room's detail
  modal directly from a URL.
- **Catch-all** `path="*"`: matches anything not matched above → `NotFound.jsx`.

### 4.2 Route guards — `src/components/common/ProtectedRoute.jsx`
```jsx
export default function ProtectedRoute() {
  const { isLoggedIn } = useSelector(selectAuth)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <Outlet />
}
```
This is a **layout route with no path** — it doesn't render any UI itself, it
just decides: "should the child routes render, or should we redirect?" Any
route nested under `<Route element={<ProtectedRoute />}>` in `App.jsx`
automatically gets this check for free, without repeating the login check on
every single page component. `PublicOnlyRoute` in the same file does the
opposite — redirects **away** from `/login` if you're already signed in.

### 4.3 `<Outlet />`
Used in `AppLayout.jsx`. It's a placeholder — "render whatever child route
matched, right here." Without it, nested routes would have nowhere to appear.

### 4.4 Router hooks used
| Hook | What it gives you | Used in |
|---|---|---|
| `useNavigate()` | A function to change routes in code (`navigate('/app/rooms')`) | Almost every page, `Sidebar.jsx`, `CommandPalette.jsx` |
| `useLocation()` | The current URL info (`location.pathname`) | `AppLayout.jsx` — to pick the right page title |
| `useParams()` | Dynamic segments from the URL (`{ roomId }`) | `RoomsPage.jsx` |
| `useSearchParams()` | Read/write `?query=params` | `Complaints.jsx`, `LeaveRequests.jsx`, `Visitors.jsx` — the "Quick Actions" floating button opens `/app/complaints?new=1`, and the page reads that param to auto-open its form, then clears it |
| `<NavLink>` | Like `<Link>` but knows if it's the *active* route | `Sidebar.jsx` — lights up the current nav item |

---

## 5. The 9 custom hooks — reusable logic, explained one by one

A **custom hook** is just a normal JavaScript function whose name starts with
`use` and that calls other hooks inside it. It lets you extract a piece of
stateful logic and reuse it across components, instead of copy-pasting
`useState`/`useEffect` blocks everywhere.

| Hook | File | What it does | Used in |
|---|---|---|---|
| `useToggle` | `hooks/useToggle.js` | Boolean state + a `toggle()` function | `QuickActionsFab.jsx` (open/close the FAB menu) |
| `useLocalStorage` | `hooks/useLocalStorage.js` | State that auto-syncs to `localStorage` | Available for any component needing persisted local state |
| `useFilter` | `hooks/useFilter.js` | Search text + status dropdown filtering over a list | `Complaints.jsx`, `LeaveRequests.jsx`, `Visitors.jsx`, `RoomsPage.jsx` |
| `useDebounce` | `hooks/useDebounce.js` | Delays updating a value until typing pauses | `TopBar.jsx` — the quick search doesn't re-filter on every keystroke |
| `useMediaQuery` | `hooks/useMediaQuery.js` | Tracks whether a CSS media query currently matches | `AppLayout.jsx` — auto-collapses the sidebar under 980px width |
| `useOnClickOutside` | `hooks/useOnClickOutside.js` | Fires a callback when you click outside an element | `Modal.jsx`, `CommandPalette.jsx`, `TopBar.jsx` (search dropdown), `QuickActionsFab.jsx` |
| `useKeyPress` | `hooks/useKeyPress.js` | Fires a callback on a specific keypress | `Modal.jsx` (Esc closes), `TopBar.jsx` (`/` focuses search) |
| `useInterval` | `hooks/useInterval.js` | A declarative `setInterval` | `TopBar.jsx` — ticks the live duty clock every second |
| `useTranslation` | `hooks/useTranslation.js` | Reads the current language from Redux and returns a `t()` function | `Sidebar.jsx`, `Login.jsx`, `Settings.jsx`, `AppLayout.jsx` |

**Why bother?** Look at `useOnClickOutside` — it's used in 4 different
components. Without the hook, you'd write the same "add an event listener,
check if the click target is outside the ref, clean up on unmount" logic four
separate times. The hook writes it once; every component just calls it.

### Anatomy of a hook — `useDebounce.js`
```js
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```
Every time `value` changes, it starts a timer. If `value` changes *again*
before the timer fires, the **cleanup function** (`return () =>
clearTimeout(timer)`) cancels the old timer first. Only when typing pauses for
`delay` ms does `debounced` actually update. This is a very common real-world
pattern for search boxes, form validation, and autosave.

---

## 6. Component patterns

### 6.1 Presentational vs. Container components
- **Presentational** (`StatCard`, `Badge`, `EmptyState`): take props, render
  UI, know nothing about Redux or routing. Pure and reusable.
- **Container/connected** (`Dashboard`, `Complaints`, `Sidebar`): call
  `useSelector`/`useDispatch`, own the "smart" logic, and pass simple props
  down to presentational components.

### 6.2 Compound/wrapper components
`Modal.jsx` is a generic wrapper — any page can open it with different
`title`, `children`, and `footer` content. `Complaints.jsx`, `LeaveRequests.jsx`,
and `Visitors.jsx` all reuse the exact same `Modal` for their "add new" forms.

### 6.3 Controlled form inputs
Every `<input>`/`<select>`/`<textarea>` in the app is a **controlled
component** — its value comes from React state, and every keystroke updates
that state via `onChange`:
```jsx
<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
```
This means React is always the single source of truth for form data, not the
DOM.

### 6.4 Conditional rendering by role
`Dashboard.jsx`, `RoomsPage.jsx`, `Complaints.jsx`, etc. all branch early:
```jsx
if (role === 'admin') { return (...) }
// otherwise render the resident view
```
Same route, same component, two very different UIs — driven entirely by data
from Redux (`auth.role`), not by having two separate pages.

---

## 7. CSS architecture

### 7.1 Design tokens — `src/styles/tokens.css`
All colors, fonts, radii, and shadows are defined once as **CSS custom
properties** (variables):
```css
:root {
  --bg: #ffffff;
  --pink: #ffc6e2;
  --font-display: 'Baloo 2', sans-serif;
}
```
Every component's CSS then uses `var(--pink)` instead of hardcoding a hex
value. Change the token once, and every button/badge/card across the whole
app updates — this is exactly how the dark mode, font themes, and button
skins work.

### 7.2 Theming via CSS classes, not JS style props
```css
.dark { --bg: #171826; --pink: #ff9ecf; }
.font-classic { --font-display: 'Space Grotesk', sans-serif; }
```
`AppLayout.jsx` just toggles class names on a wrapper `<div>`
(`className={`${isDark ? 'dark' : ''} font-${fontTheme}`}`). The browser
handles re-painting every element that uses those variables — no per-element
JavaScript needed.

### 7.3 Utility-ish shared classes
`src/index.css` defines reusable classes like `.btn`, `.card`, `.badge`,
`.panel`, `.stat-grid` used across every page, so pages don't redefine the
same button/card styles repeatedly.

### 7.4 Component-scoped CSS files
Bigger components (`Sidebar.css`, `TopBar.css`, `Modal.css`, `Login.css`,
`CommandPalette.css`, etc.) keep their specific styles in a same-named CSS
file next to the `.jsx` file — easy to find, easy to delete together if the
component is removed.

### 7.5 Pure-CSS data visualization
`OccupancyDonut.jsx` builds a donut chart with **no charting library** —
just a `conic-gradient()`:
```jsx
style={{ background: `conic-gradient(var(--pink-border) ${percent * 3.6}deg, var(--surface-2) 0deg)` }}
```
A circle is 360°, so `percent * 3.6` converts a 0–100 percentage into degrees.

---

## 8. Internationalization (i18n) — how the language switcher works

This project rolls its own tiny i18n system rather than pulling in a library:

1. **Dictionary** — `src/i18n/translations.js` has one object per language
   (`en`, `ta`, `hi`, `te`, `ml`, `kn`), each mapping the same set of keys
   (`nav_dashboard`, `login_welcome`, ...) to that language's text.
2. **Lookup function**:
   ```js
   export function translate(language, key) {
     return dict[language]?.[key] ?? dict.en[key] ?? key
   }
   ```
   Falls back to English, then to the raw key itself, so a missing
   translation never crashes the UI — it just shows something readable.
3. **The hook** — `useTranslation.js` reads the current language out of
   Redux (`ui.language`) and returns a `t()` function.
4. **Usage in components**:
   ```jsx
   const { t } = useTranslation()
   <span>{t('nav_dashboard')}</span>
   ```
5. **Changing language** dispatches `setLanguage('hi')` from `Settings.jsx`,
   which updates Redux — every component using `t()` re-renders with the new
   text automatically, because they're all subscribed to that same slice.

This is the same core idea as big i18n libraries (`react-i18next`,
`react-intl`) — just built minimally by hand.

---

## 9. Persistence — remembering preferences across reloads

`localStorage` is the browser's built-in key-value storage that survives page
reloads (unlike React state, which resets). The pattern used everywhere:

```js
// Read on startup (uiSlice.js)
function readStored(key, fallback) {
  const raw = window.localStorage.getItem(key)
  return raw !== null ? JSON.parse(raw) : fallback
}
const initialState = { isDark: readStored('vidudhi:isDark', false), ... }

// Write on change (AppLayout.jsx)
useEffect(() => {
  window.localStorage.setItem('vidudhi:isDark', JSON.stringify(isDark))
}, [isDark])
```
Read once when the Redux slice is created; write every time the value
changes via a `useEffect`. This is why theme, font, language, and button skin
all "stick" the next time you open the app.

---

## 10. UX features and the patterns behind them

### 10.1 Toasts (`src/components/common/Toast.jsx`)
A queue of temporary messages stored in Redux (`ui.toasts`). Any component
can call `dispatch(pushToast('Complaint submitted', 'ok'))` from anywhere.
Each toast schedules its own removal with `setTimeout` inside a `useEffect`,
then dispatches `dismissToast(id)`.

### 10.2 Command Palette (`CommandPalette.jsx`)
- Listens globally for `Ctrl+K` / `Cmd+K` via a `keydown` listener in
  `useEffect`.
- Builds a list of "commands" with `useMemo` (each one is just `{ label, icon,
  run() }`).
- Filters that list against the typed query.
- Handles `ArrowUp`/`ArrowDown`/`Enter` manually for keyboard navigation.
- Closes on outside click via `useOnClickOutside`.

This is the same interaction pattern as VS Code's command palette or Slack's
`Ctrl+K` — a single fast entry point to "do anything" without hunting through
menus.

### 10.3 Floating Quick Actions (`QuickActionsFab.jsx`)
A round button that toggles open/closed with `useToggle`, and closes itself
if you click elsewhere via `useOnClickOutside`. Its three mini-buttons use
`navigate('/app/complaints?new=1')` — combining **React Router navigation**
with **query params** to tell the destination page "open your form
immediately."

### 10.4 Confetti (`Confetti.jsx`)
A purely visual, no-dependency animation: renders ~26 `<span>` elements with
randomized `left`, `animation-delay`, and `rotate` values (computed once via
`useMemo`), each animated by a CSS `@keyframes confetti-fall` that translates
them downward and fades them out. A `setTimeout` in `useEffect` unmounts them
after ~1 second.

### 10.5 Debounced search with results dropdown (`TopBar.jsx`)
Combines four different concepts in one feature: `useState` (query text),
`useDebounce` (don't search on every keystroke), `useMemo` (only recompute
results when the debounced query or data changes), and
`useOnClickOutside`/`useKeyPress` (close the dropdown on outside click or
Esc).

---

## 11. Build tooling

- **Vite** (`vite.config.js`): the dev server and bundler. `npm run dev`
  starts a local server with instant hot-reload; `npm run build` produces an
  optimized production bundle in `dist/`.
- **`@vitejs/plugin-react`**: teaches Vite how to compile JSX into regular
  JavaScript.
- **`package.json` scripts**: `dev`, `build`, `preview` are shortcuts defined
  once so you don't have to remember raw CLI commands.
- **ES Modules** (`type: "module"` in `package.json`, `import`/`export`
  everywhere): the modern standard way JavaScript files share code between
  each other, instead of older `require()`/`module.exports`.

---

## 12. How to trace any feature yourself

Next time you want to understand a feature, follow this order:
1. **Find the page** in `src/pages/` that renders it.
2. **Find the Redux slice** it reads (`useSelector(selectX)`) or writes to
   (`dispatch(someAction())`) in `src/store/slices/`.
3. **Find any custom hooks** it calls in `src/hooks/`.
4. **Find the CSS file** with the same name as the component for styling.

That four-step trace covers almost everything in this codebase, because the
architecture is consistent everywhere: **page → redux → hooks → css**.
