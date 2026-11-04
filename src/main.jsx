import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1'
const Admin = React.lazy(() => import('./Admin.jsx'))

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <React.Suspense fallback={<div className="grid min-h-screen place-items-center bg-paper font-mono text-xs">LOADING CONTENT STUDIO…</div>}><Admin/></React.Suspense> : <App/>}
  </React.StrictMode>,
)
