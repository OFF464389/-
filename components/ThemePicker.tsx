
import React from 'react';
import { X } from 'lucide-react';
import { PASTEL_THEMES } from '../constants';

interface ThemePickerProps {
  currentTheme: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  t: any;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, onSelect, onClose, t }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 paper-shadow border border-white">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h3 className="font-black text-lg tracking-tight">{t.pickPalette}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors active-scale">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 gap-3">
          {Object.entries(PASTEL_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all group active-scale
                ${currentTheme === key ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}
              `}
            >
              <div className={`w-12 h-12 rounded-lg shadow-inner ${theme.accent} border border-white`} />
              <div className="flex-1 text-left">
                <span className={`font-black text-base block ${theme.text}`}>{theme.name}</span>
                <span className="text-[9px] opacity-30 font-bold uppercase tracking-widest">{t.theme}</span>
              </div>
              {currentTheme === key && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemePicker;