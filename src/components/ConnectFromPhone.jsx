import { useState, useEffect } from 'react';

/**
 * Solo en desarrollo: muestra un botón flotante que al pulsar muestra
 * la URL de red y un QR para abrir la app en el móvil (misma WiFi).
 * No se muestra en dispositivos móviles (ya estás en el móvil).
 */
export default function ConnectFromPhone() {
  const [url, setUrl] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDev = import.meta.env.DEV;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isDev || isMobile) {
      setLoading(false);
      return;
    }
    fetch('/__network_url')
      .then((r) => r.json())
      .then((data) => setUrl(data?.url || null))
      .catch(() => setUrl(null))
      .finally(() => setLoading(false));
  }, [isDev, isMobile]);

  if (!isDev || isMobile || loading) return null;
  if (!url) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-onix-primary text-white shadow-lg transition hover:scale-105"
        title="Abrir en el móvil"
        aria-label="Ver QR para abrir en el móvil"
      >
        <span className="text-xl" aria-hidden>📱</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Código QR para abrir en el móvil"
        >
          <div
            className="rounded-2xl bg-onix-bg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-center font-medium text-onix-fg">
              Escanea con el móvil (misma WiFi)
            </p>
            <img
              src={qrSrc}
              alt=""
              className="mx-auto rounded-lg border border-onix-border"
              width={180}
              height={180}
            />
            <p className="mt-3 break-all text-center text-sm text-onix-muted">{url}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg bg-onix-muted/20 py-2 text-sm font-medium text-onix-fg hover:bg-onix-muted/30"
            >
              Cerrar
            </button>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
