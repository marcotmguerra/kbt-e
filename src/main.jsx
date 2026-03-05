import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import './styles/base.css'
import './styles/admin.css'
import './styles/professor.css'
import './styles/pos-aula.css'
import './styles/detalhe.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)