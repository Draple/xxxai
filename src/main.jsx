import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';
import { translations } from './i18n/translations';
import App from './App';
import './index.css';

const LANG_STORAGE_KEY = 'xxxai_lang';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      const lang = typeof localStorage !== 'undefined' ? (localStorage.getItem(LANG_STORAGE_KEY) || 'es') : 'es';
      const t = (key) => translations[lang]?.[key] ?? translations.es?.[key] ?? key;
      return (
        <div style={{
          minHeight: '100vh',
          background: '#08080c',
          color: '#a1a1aa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ color: '#fff', marginBottom: 8 }}>{t('errorBoundaryTitle')}</h1>
          <p style={{ marginBottom: 16, textAlign: 'center' }}>{this.state.error?.message || t('errorBoundaryMessage')}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#e045c5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {t('errorBoundaryReload')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <LanguageProvider>
          <AuthProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
