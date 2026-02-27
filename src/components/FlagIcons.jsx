/**
 * Banderas en SVG para compatibilidad en Windows y todos los navegadores.
 * Uso: <FlagES className="w-5 h-4" />, <FlagEN className="w-5 h-4" />
 */
export function FlagES({ className = 'w-5 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="20" height="4" fill="#AA151B" />
      <rect y="4" width="20" height="8" fill="#F1BF00" />
      <rect y="12" width="20" height="4" fill="#AA151B" />
    </svg>
  );
}

export function FlagEN({ className = 'w-5 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="20" height="16" fill="#012169" />
      <path d="M0 0L20 16M20 0L0 16" stroke="white" strokeWidth="2.67" />
      <path d="M0 0L20 16M20 0L0 16" stroke="#C8102E" strokeWidth="1.33" />
      <path d="M10 0v16M0 8h20" stroke="white" strokeWidth="4" />
      <path d="M10 0v16M0 8h20" stroke="#C8102E" strokeWidth="2" />
    </svg>
  );
}
