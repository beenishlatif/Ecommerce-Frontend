export default function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center gap-3 py-24">
      <div className="h-10 w-10 rounded-full border-2 border-lilac-300 border-t-transparent animate-spin" />
      <p className="text-sm text-charcoal-400">{label}</p>
    </div>
  );
}
