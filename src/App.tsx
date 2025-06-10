import React from 'react';
import AppRouter from './routes';
import './i18n'; // Initialize i18next
import { ConfigProvider } from 'antd'; // Import Ant Design's ConfigProvider
import enUS from 'antd/locale/en_US'; // Ant Design English locale
import esES from 'antd/locale/es_ES'; // Ant Design Spanish locale
import { useTranslation } from 'react-i18next'; // To get current language

// Basic CSS reset / global styles (optional, can be expanded)
import './App.css'; // Create this file if it doesn't exist

const App: React.FC = () => {
  const { i18n } = useTranslation();

  // Determine Ant Design locale based on i18next language
  const antdLocale = i18n.language.startsWith('es') ? esES : enUS;

  return (
    <ConfigProvider locale={antdLocale}>
      <React.Suspense fallback="Loading..."> {/* Recommended for i18next */}
        <AppRouter />
      </React.Suspense>
    </ConfigProvider>
  );
};

export default App;
