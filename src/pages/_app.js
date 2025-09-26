import { TradingProvider, useTrading } from '../context/TradingContext';
import Auth from '../components/Auth';
import '../styles/globals.css';

function AppContent({ Component, pageProps }) {
  const { user, authLoading } = useTrading();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-trading-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trading-pink"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }) {
  return (
    <TradingProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </TradingProvider>
  );
}