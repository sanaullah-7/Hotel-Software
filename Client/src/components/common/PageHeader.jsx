export default function PageHeader({ title, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  );
}
