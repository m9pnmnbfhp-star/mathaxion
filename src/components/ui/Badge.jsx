export default function Badge({ children, color = 'violet', size = 'sm', dot = false }) {
  const colors = {
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  }
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  const dotColors = {
    violet: 'bg-violet-400', blue: 'bg-blue-400', green: 'bg-emerald-400',
    red: 'bg-red-400', amber: 'bg-amber-400', slate: 'bg-slate-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colors[color]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || 'bg-violet-400'}`} />}
      {children}
    </span>
  )
}
