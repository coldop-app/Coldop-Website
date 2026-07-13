type ReportPlaceholderProps = {
  title: string;
};

export function ReportPlaceholder({ title }: ReportPlaceholderProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">Reports are coming soon.</p>
    </div>
  );
}
