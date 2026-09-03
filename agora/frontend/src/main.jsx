import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { AgoraProvider } from './context/AgoraContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AgoraProvider>
        <App />
      </AgoraProvider>
    </AuthProvider>
  </React.StrictMode>,
)
