export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="card p-8 text-center">
    <p className="text-base font-semibold">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);
