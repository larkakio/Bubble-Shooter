export function CyberBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]">
      <div className="cyber-grid absolute inset-0 opacity-40" />
      <div className="data-rain absolute inset-0" />
      <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-magenta-500/10 blur-[100px]" />
    </div>
  );
}
