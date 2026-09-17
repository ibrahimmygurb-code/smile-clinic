type PageHeaderProps = {
  badge: string;
  title: string;
  description: string;
};

export default function PageHeader({ badge, title, description }: PageHeaderProps) {
  return (
    <section className="space-y-3">
      <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
        {badge}
      </span>
      <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base leading-8 text-muted md:text-lg">{description}</p>
    </section>
  );
}
