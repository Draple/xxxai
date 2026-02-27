/**
 * Tarjeta estilo promo: imagen a la izquierda, panel rosa y nombre del pack.
 */
export default function LiveActionCard({ name, imageSrc, tag, selected, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 min-h-[100px] w-full ${selected ? 'border-onix-accent shadow-glow-sm scale-[1.02]' : 'border-onix-border hover:border-onix-border-light'} ${className}`}
      aria-pressed={selected}
    >
      {/* Panel rosa + nombre (sin imagen) */}
      <div className="flex-1 relative flex flex-col justify-center py-4 px-4 bg-[#ec4899] min-w-0">
        {tag && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white">{tag}</span>
          </div>
        )}
        {name && (
          <div className={`font-display font-bold text-white text-2xl sm:text-3xl uppercase tracking-tight ${tag ? 'mt-6' : ''}`}>
            {name}
          </div>
        )}
      </div>
      {selected && (
        <span className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded-full bg-white text-pink-600 shadow-md" aria-hidden>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </span>
      )}
    </button>
  );
}
