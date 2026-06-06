export default function Slider({ value, onChange, min = 0, max = 4, step = 1, labels = [] }) {
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none rounded-full cursor-pointer
          bg-gradient-to-r from-violet-600 to-violet-400
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:cursor-grab
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-violet-400
          [&:active::-webkit-slider-thumb]:cursor-grabbing"
        style={{
          background: `linear-gradient(to right, #7c3aed ${(value / max) * 100}%, #2a2a3a ${(value / max) * 100}%)`,
        }}
      />
      {labels.length > 0 && (
        <div className="flex justify-between">
          {labels.map((label, i) => (
            <span
              key={i}
              className={`text-[11px] font-medium transition-colors ${
                i === value ? 'text-violet-400' : 'text-slate-500'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
