import { Link } from 'react-router-dom';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

export default function LegalPageLayout({ title, subtitle, lastUpdated, sections }) {
  return (
    <div className="min-h-screen bg-onix-bg flex flex-col">
      <div className="fixed inset-0 bg-mesh pointer-events-none" aria-hidden />
      <header className="relative z-10 border-b border-onix-border/80 bg-onix-bg/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5 text-onix-mutedLight hover:text-white transition-colors">
            <span>←</span>
            <span className="font-display font-semibold">XXXAI</span>
          </Link>
          <LanguageSwitcher variant="compact" size="sm" />
        </div>
      </header>
      <main id="main-content" className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 sm:py-10 md:py-14" role="main">
        <h1 className="font-display font-bold text-white text-3xl sm:text-4xl tracking-tight mb-2">{title}</h1>
        <p className="text-onix-mutedLight text-lg mb-2">{subtitle}</p>
        <p className="text-onix-muted text-sm mb-10">{lastUpdated}</p>
        <div className="space-y-8 text-zinc-300">
          {sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-white font-display font-semibold text-xl mb-3">{sec.title}</h2>
              {Array.isArray(sec.body) ? (
                sec.body.map((p, j) => <p key={j} className="leading-relaxed mb-3 last:mb-0">{p}</p>)
              ) : (
                <p className="leading-relaxed">{sec.body}</p>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
