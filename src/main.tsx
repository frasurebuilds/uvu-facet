
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createInitialUser } from './lib/services.ts'

// Attempt to create the initial user
createInitialUser()
  .then(result => {
    console.log("Initial user setup result:", result);
  })
  .catch(error => {
    console.error("Failed to set up initial user:", error);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
