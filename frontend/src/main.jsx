import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5000/api';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
