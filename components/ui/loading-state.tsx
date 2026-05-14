export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <div className="card animate-pulse p-8 text-center text-slate-500">{label}</div>
);
