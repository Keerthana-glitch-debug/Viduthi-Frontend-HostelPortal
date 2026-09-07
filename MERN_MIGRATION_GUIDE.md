# From "Fake Data in Redux" to Full MERN Stack

## 1. What is MERN, in baby terms?

Right now your app is like a restaurant where the "kitchen" (data) is a
notepad taped under the counter (`seedData.js` + Redux, which lives only in
the browser and resets every refresh).

MERN means building a **real kitchen** that lives on a server, so the data is
permanent and shared between everyone who visits:

| Letter | What it is | Job |
|---|---|---|
| **M** — MongoDB | A database | Where the data is *actually* saved, permanently |
| **E** — Express | A tiny web server framework (runs on Node) | Listens for requests like "give me all complaints" and answers them |
| **R** — React | What you already have | The screen the user sees and clicks on |
| **N** — Node.js | The engine that runs JavaScript outside the browser | Runs your Express server |

**The key idea:** React never talks to MongoDB directly. It's always:

```
React (browser)  --- HTTP request --->  Express server  --- query --->  MongoDB
React (browser)  <--- JSON response ---  Express server  <--- data ---  MongoDB
```

React just asks Express "give me the complaints" over the network (using
`fetch`), and Express is the only one allowed to talk to the database.

---

## 2. Why your app is already set up well for this

You already separated your app into layers (from the concept guide):
`page → redux → hooks → css`. That separation is *exactly* what makes this
migration easy. Today, your Redux slices get their starting data from
`seedData.js` (fake, hardcoded). Later, they'll get it from a real server
instead. **The pages, components, and hooks don't have to change at all** —
only the slices change *where they get their data from*.

---

## 3. The one core concept you need: `createAsyncThunk`

Right now, a slice reducer runs instantly and synchronously:
```js
addComplaint: (state, action) => { state.unshift(action.payload) }
```

But talking to a server takes time (the request has to travel over the
internet and come back). Redux Toolkit has a built-in tool for this called
`createAsyncThunk` — think of it as "a reducer that's allowed to wait."

```js
import { createAsyncThunk } from '@reduxjs/toolkit'

// This describes: "go fetch complaints from the server"
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async () => {
    const res = await fetch('/api/complaints')
    return res.json() // whatever the server sends back
  }
)
```

A thunk automatically fires **three** actions as it runs, and you handle each
one in `extraReducers`:

```js
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {
    // keep any purely local reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.status = 'loading'          // "still waiting..."
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload       // "got it! here's the data"
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message // "something went wrong"
      })
  },
})
```

This is the **only new Redux concept** you need to learn. Everything else
(`useSelector`, `useDispatch`, `useEffect` to trigger the fetch on page load)
you already know.

---

## 4. Step-by-step migration path (do this in order, app keeps working the whole time)

### Step A — Build the backend first, separately

Create a **new**, separate folder next to your frontend (not inside `src/`):

```
vidudhi-backend/
  server.js
  models/
    Room.js
    Complaint.js
    LeaveRequest.js
    Visitor.js
    Notification.js
    User.js
  routes/
    rooms.js
    complaints.js
    leave.js
    visitors.js
    notifications.js
    auth.js
  middleware/
    auth.js        (checks the JWT token on protected routes)
  .env             (secrets — never commit this to git)
```

Minimal `server.js` to get oriented:
```js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())           // allows your React app (different port) to call this server
app.use(express.json())   // lets Express read JSON request bodies

mongoose.connect(process.env.MONGO_URI)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/rooms', require('./routes/rooms'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/leave', require('./routes/leave'))
app.use('/api/visitors', require('./routes/visitors'))
app.use('/api/notifications', require('./routes/notifications'))

app.listen(5000, () => console.log('Server running on port 5000'))
```

A Mongoose model mirrors the shape you already have in `seedData.js` almost
exactly — this is why your existing data shapes were a good investment:
```js
// models/Complaint.js
const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High'] },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  roomNumber: String,
  raisedBy: String,
  date: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Complaint', complaintSchema)
```

A route file is basically "if someone visits this URL with this HTTP method,
do this":
```js
// routes/complaints.js
const router = require('express').Router()
const Complaint = require('../models/Complaint')

router.get('/', async (req, res) => {
  const complaints = await Complaint.find().sort({ date: -1 })
  res.json(complaints)
})

router.post('/', async (req, res) => {
  const complaint = await Complaint.create(req.body)
  res.status(201).json(complaint)
})

router.patch('/:id', async (req, res) => {
  const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
})

module.exports = router
```

Run it locally with `node server.js` (or `nodemon server.js` for
auto-restart). Test it works using a tool like Postman or just your browser
at `http://localhost:5000/api/complaints` before touching React at all.

### Step B — Add a tiny API layer to the frontend

Don't scatter `fetch()` calls everywhere. Put them in one place:

```js
// src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('vidudhi:token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
```

`import.meta.env.VITE_API_URL` reads from a `.env` file in your Vite project
(create `.env` at the project root, add `.env` to `.gitignore`):
```
VITE_API_URL=http://localhost:5000/api
```
This way, when you deploy later, you just change one line instead of hunting
through the codebase for hardcoded URLs.

### Step C — Convert one slice at a time (start with `complaints`)

Old (`complaintsSlice.js` today):
```js
import { initialComplaints } from '../../data/seedData'
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: initialComplaints,
  reducers: { addComplaint: {...}, updateComplaintStatus: {...} },
})
```

New:
```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api/client'

export const fetchComplaints = createAsyncThunk('complaints/fetchAll', () => api.get('/complaints'))

export const addComplaint = createAsyncThunk(
  'complaints/add',
  (newComplaint) => api.post('/complaints', newComplaint)
)

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  ({ id, status }) => api.patch(`/complaints/${id}`, { status })
)

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.fulfilled, (state, action) => { state.list = action.payload })
      .addCase(addComplaint.fulfilled, (state, action) => { state.list.unshift(action.payload) })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const i = state.list.findIndex((c) => c._id === action.payload._id)
        if (i !== -1) state.list[i] = action.payload
      })
  },
})

export const selectComplaints = (state) => state.complaints.list
export default complaintsSlice.reducer
```

Notice: **the action names stay the same** (`addComplaint`,
`updateComplaintStatus`) — only their insides changed from "instantly update
a local array" to "ask the server, then update once it replies." This means
`Complaints.jsx` barely changes.

### Step D — Trigger the initial fetch when a page loads

In `Complaints.jsx`, add one `useEffect`:
```jsx
useEffect(() => {
  dispatch(fetchComplaints())
}, [dispatch])
```
This is the same `useEffect` concept you already know — "after this page
mounts, go get fresh data from the server."

### Step E — Real authentication (replaces the fake `login(role)` from before)

Today, `authSlice.js` just flips `isLoggedIn = true` with no real check. A
real backend `POST /api/auth/login` checks the password and returns a **JWT
token** (a signed, tamper-proof string proving who you are). Store it, then
attach it to every future request (already handled in `api/client.js`
above via the `Authorization` header):

```js
export const loginUser = createAsyncThunk('auth/login', async ({ id, password, role }) => {
  const data = await api.post('/auth/login', { id, password, role })
  localStorage.setItem('vidudhi:token', data.token)
  return data.user
})
```

### Step F — Repeat Steps C–D for `rooms`, `leave`, `visitors`, `notifications`

Same pattern every time: thunks replace synchronous reducers,
`extraReducers` replaces `reducers`, everything else in the app is untouched.

---

## 5. What does NOT need to change

- Every **page component** (`Complaints.jsx`, `Dashboard.jsx`, etc.) —
  they still call `useSelector`/`useDispatch` exactly the same way.
- Every **custom hook** (`useDebounce`, `useFilter`, `useOnClickOutside`,
  etc.) — none of them care where the data came from.
- All **CSS/design** — completely unrelated to where data lives.
- **React Router** setup — unrelated to the backend.

This is the payoff of the layered architecture from the concept guide: the
backend swap only touches the Redux slice files and adds one new
`src/api/client.js` file.

---

## 6. Suggested order to actually do this (so nothing breaks midway)

1. Build the backend fully first, test every route with Postman — don't
   touch React yet.
2. Add `src/api/client.js` and a `.env` file.
3. Convert **one slice** (`complaintsSlice.js` is the smallest, best to
   start with) and get that one page working end-to-end.
4. Repeat for the rest of the slices, one at a time, testing after each.
5. Convert `authSlice.js` last, once you're comfortable — this one has the
   most moving parts (passwords, tokens, protected routes).
6. Only once everything works against the real backend, delete
   `src/data/seedData.js`.

Do it slice-by-slice, not all at once — that way the app is never fully
broken while you're mid-migration.
