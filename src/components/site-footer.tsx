export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xs tracking-widest uppercase">
          moq://bayarea — San Francisco · Oakland · Peninsula · South Bay
        </p>
        <p>Community-run. Not affiliated with the IETF.</p>
      </div>
    </footer>
  );
}
