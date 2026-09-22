import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { store } from './store/store'
import App from './App.jsx'
import './index.css'

// HashRouter (URLs like /#/app/rooms) instead of BrowserRouter is used here
// because GitHub Pages is a static file host with no server-side routing —
// it can't redirect a refresh on /app/rooms back to index.html. HashRouter
// sidesteps that entirely: the part after # never even reaches the server.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
)
