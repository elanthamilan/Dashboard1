import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Ensure i18n is initialized, App.tsx also imports it, but good to have here for clarity
import './i18n';
// If you have global CSS not covered by App.css (e.g., from Ant Design), import it here
// import 'antd/dist/reset.css'; // Or the v5 equivalent if using AntD v5

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
