export function SettingRow({
  icon: Icon,
  label,
  value,
  onChange,
  unit,
  min = 1,
  max = 999,
}: {
  icon: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
}) {
  const handleValueChange = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    onChange(clamped);
  };

  return (
    <div className="bg-[#f8f9ff] p-5 rounded-[24px] border border-[--theme-primary]/5 flex items-center justify-between group hover:border-[--theme-primary]/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[--theme-primary]">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-black text-[--theme-primary]/40 uppercase tracking-widest mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold text-[--theme-primary]">
            {value} {unit}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-[--theme-primary]/5">
        <button
          onClick={() => handleValueChange(value - 1)}
          className="w-8 h-8 rounded-lg hover:bg-[#f0f2ff] flex items-center justify-center text-[--theme-primary] transition-colors disabled:opacity-30"
          disabled={value <= min}
        >
          -
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) handleValueChange(val);
          }}
          className="w-12 text-center font-black text-[--theme-primary] tabular-nums bg-transparent border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => handleValueChange(value + 1)}
          className="w-8 h-8 rounded-lg hover:bg-[#f0f2ff] flex items-center justify-center text-[--theme-primary] transition-colors disabled:opacity-30"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
