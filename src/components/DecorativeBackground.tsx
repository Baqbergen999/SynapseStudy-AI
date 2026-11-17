export function DecorativeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-indigo-600/18 blur-[120px] animate-float-slow" />
      <div className="absolute top-[28%] -right-28 h-[380px] w-[380px] rounded-full bg-violet-600/15 blur-[120px] animate-float-reverse" />
      <div className="absolute -bottom-36 left-[30%] h-[360px] w-[360px] rounded-full bg-emerald-500/12 blur-[120px] animate-float-slow" />
    </div>
  );
}
