export default function Toggle({ label, checked, onChange, disabled = false }) {
    return (
        <label className={`flex items-center justify-between cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-600' : 'bg-white/10'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </div>
        </label>
    );
}
