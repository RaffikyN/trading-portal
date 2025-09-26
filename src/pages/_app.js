import { TradingProvider } from '../context/TradingContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <TradingProvider>
      <Component {...pageProps} />
    </TradingProvider>
  );
}