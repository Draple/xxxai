/**
 * Tarjeta promocional: imagen de fondo, overlay rosa a la derecha, título.
 * Usa <img> para que las imágenes se carguen y se vean correctamente.
 */
import { useState } from 'react';

const OBJECT_POSITION_MAP = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

export default function PromoCard({ image, tag, title, imagePosition = 'center', className = '' }) {
  const [imageError, setImageError] = useState(false);
  const showImage = image && !imageError;
  const objectPosition = OBJECT_POSITION_MAP[imagePosition] || 'center';

  return (
    <article
      className={`relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl overflow-hidden bg-onix-card group ${className}`}
    >
      {/* Capa de imagen: <img> con object-fit para que siempre se vea */}
      {showImage ? (
        <img
          src={image}
          alt={title ? `${title}` : ''}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/80 via-rose-600/70 to-fuchsia-800/80" />
      )}
      {/* Overlay rosa a la derecha (más estrecho para que se vea más la imagen) */}
      <div
        className="absolute inset-y-0 right-0 w-[45%] sm:w-[42%] bg-gradient-to-l from-pink-500/85 via-pink-500/60 to-transparent"
        aria-hidden
      />
      {/* Contenido sobre el overlay */}
      <div className="absolute inset-y-0 right-0 w-[45%] sm:w-[42%] flex flex-col justify-center items-end pr-4 sm:pr-6 pl-6">
        {tag && (
          <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden />
            {tag}
          </span>
        )}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight drop-shadow-lg">
          {title}
        </h3>
      </div>
    </article>
  );
}
