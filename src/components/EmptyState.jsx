export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="mb-4 h-16 w-16 rounded-full bg-lilac-100 flex items-center justify-center">
          <Icon className="h-7 w-7 text-lilac-500" />
        </div>
      )}
      <h3 className="text-xl font-display font-semibold text-charcoal-700 mb-2">{title}</h3>
      {description && <p className="text-charcoal-400 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
