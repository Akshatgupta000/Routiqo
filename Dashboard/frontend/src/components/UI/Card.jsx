export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-900/5 backdrop-blur-sm transition-shadow duration-200 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/40 ${padding ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
