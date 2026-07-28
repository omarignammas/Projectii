export const PageHero = ({ icon: Icon, title, subtitle, action }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 mb-8 flex flex-col items-start justify-between gap-4 duration-500 sm:flex-row sm:items-end">
    <div>
      {Icon && (
        <div className="hero-icon mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHero;
