/**
 * Enlace "Ir al contenido" para accesibilidad (teclado y lectores de pantalla).
 * Visible solo al recibir foco.
 */
import { useLanguage } from '../context/LanguageContext';

export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-onix-accent focus:px-4 focus:py-3 focus:text-white focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-onix-bg"
    >
      {t('skipToContent')}
    </a>
  );
}
