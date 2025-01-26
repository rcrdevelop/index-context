import '../styles/globals.css'; // Asegúrate de importar tus estilos globales
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;