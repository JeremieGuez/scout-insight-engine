export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
        <img src="/logo.png" alt="chameleon logo" className="h-7 w-7 rounded-full" />
        <span className="text-xl font-semibold lowercase">chameleon</span>
      </div>
    </header>
  );
}
