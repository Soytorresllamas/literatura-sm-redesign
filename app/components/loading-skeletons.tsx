function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

function LoadingHeader() {
  return <div className="skeleton-header" aria-hidden="true">
    <SkeletonBlock className="skeleton-logo" />
    <div className="skeleton-nav"><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></div>
    <div className="skeleton-actions"><SkeletonBlock /><SkeletonBlock /></div>
  </div>;
}

function ScreenHeroSkeleton() {
  return <div className="skeleton-screen-hero" aria-hidden="true">
    <SkeletonBlock className="skeleton-breadcrumb" />
    <SkeletonBlock className="skeleton-eyebrow" />
    <SkeletonBlock className="skeleton-heading" />
    <SkeletonBlock className="skeleton-heading skeleton-heading-short" />
    <SkeletonBlock className="skeleton-copy" />
  </div>;
}

export function BookCardSkeleton() {
  return <article className="skeleton-book-card" aria-hidden="true">
    <SkeletonBlock className="skeleton-cover" />
    <SkeletonBlock className="skeleton-tag" />
    <SkeletonBlock className="skeleton-title" />
    <SkeletonBlock className="skeleton-title skeleton-title-short" />
    <SkeletonBlock className="skeleton-author" />
    <div className="skeleton-pills"><SkeletonBlock /><SkeletonBlock /></div>
  </article>;
}

function LoadingAnnouncement() {
  return <span className="sr-only">Cargando contenido…</span>;
}

export function PageLoadingSkeleton() {
  return <main className="skeleton-page" aria-busy="true" aria-live="polite">
    <LoadingAnnouncement />
    <LoadingHeader />
    <ScreenHeroSkeleton />
    <section className="skeleton-content">
      <div className="skeleton-section-heading"><SkeletonBlock className="skeleton-heading-small" /><SkeletonBlock className="skeleton-link" /></div>
      <div className="skeleton-grid">{Array.from({ length: 6 }, (_, index) => <BookCardSkeleton key={index} />)}</div>
    </section>
  </main>;
}

export function CatalogPageSkeleton() {
  return <main className="skeleton-page" aria-busy="true" aria-live="polite">
    <LoadingAnnouncement />
    <LoadingHeader />
    <ScreenHeroSkeleton />
    <section className="skeleton-catalog-layout">
      <aside className="skeleton-filter" aria-hidden="true">
        <SkeletonBlock className="skeleton-filter-title" />
        <SkeletonBlock className="skeleton-filter-search" />
        {Array.from({ length: 6 }, (_, index) => <SkeletonBlock className="skeleton-filter-option" key={index} />)}
      </aside>
      <div>
        <div className="skeleton-toolbar" aria-hidden="true"><SkeletonBlock /><SkeletonBlock /></div>
        <div className="skeleton-grid">{Array.from({ length: 9 }, (_, index) => <BookCardSkeleton key={index} />)}</div>
      </div>
    </section>
  </main>;
}

export function BookDetailPageSkeleton() {
  return <main className="skeleton-page" aria-busy="true" aria-live="polite">
    <LoadingAnnouncement />
    <LoadingHeader />
    <SkeletonBlock className="skeleton-detail-breadcrumb" />
    <section className="skeleton-detail">
      <SkeletonBlock className="skeleton-detail-cover" />
      <div className="skeleton-detail-copy" aria-hidden="true">
        <SkeletonBlock className="skeleton-eyebrow" />
        <SkeletonBlock className="skeleton-heading" />
        <SkeletonBlock className="skeleton-heading skeleton-heading-short" />
        <SkeletonBlock className="skeleton-author" />
        <SkeletonBlock className="skeleton-copy" />
        <SkeletonBlock className="skeleton-copy skeleton-copy-short" />
        <SkeletonBlock className="skeleton-detail-button" />
        <div className="skeleton-pills"><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></div>
      </div>
    </section>
    <section className="skeleton-detail-info" aria-hidden="true">
      <SkeletonBlock className="skeleton-heading-small" />
      <div className="skeleton-info-grid">{Array.from({ length: 3 }, (_, index) => <div key={index}><SkeletonBlock className="skeleton-title" /><SkeletonBlock className="skeleton-copy" /><SkeletonBlock className="skeleton-copy skeleton-copy-short" /></div>)}</div>
    </section>
  </main>;
}
