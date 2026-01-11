
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, Save, Sparkles } from 'lucide-react';
import { Goal, Theme } from '../types';
import { RECOMMEND_KEYWORDS } from '../constants';

interface DetailModalProps {
  goal: Goal;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Goal>, soundType: 'none' | 'register' | 'complete' | 'click') => void;
  theme: Theme;
  t: any;
}

const DetailModal: React.FC<DetailModalProps> = ({ goal, onClose, onSave, theme, t }) => {
  const [text, setText] = useState(goal.text);
  const [notes, setNotes] = useState(goal.notes);

  const handleRegister = () => {
    // 저장 버튼 클릭 시 즉시 부모 상태 업데이트 및 등록 소리 재생
    onSave(goal.id, { text, notes }, 'register'); 
    onClose();
  };

  const handleToggleComplete = () => {
    const nextVal = !goal.isCompleted;
    onSave(goal.id, { isCompleted: nextVal, text, notes }, nextVal ? 'complete' : 'click');
  };

  const handleApplyKeyword = (kw: string) => {
    onSave(goal.id, { text: kw }, 'click'); // 키워드 선택 시 가벼운 소리
    setText(kw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`w-full max-w-xl ${theme.card} rounded-t-2xl shadow-lg overflow-hidden animate-in slide-in-from-bottom duration-300 safe-bottom border-t border-white/50`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-black/5 rounded-full mx-auto mt-3 mb-1" />
        
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
            <Sparkles size={18} /> {t.goalDetails}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full active-scale">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-5 overflow-y-auto max-h-[75vh] no-scrollbar">
          <div>
            <label className="block text-[10px] font-black opacity-30 mb-2 uppercase tracking-[0.1em]">{t.theGoal}</label>
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholderGoal}
              className={`w-full px-4 py-3 rounded-xl border border-transparent outline-none transition-all text-lg font-bold
                ${theme.bg} bg-opacity-40 focus:bg-opacity-80 focus:border-black/5
              `}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {RECOMMEND_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => handleApplyKeyword(kw)}
                  className={`px-3 py-1.5 ${theme.accent} bg-opacity-30 active-scale border border-black/5 text-xs font-bold rounded-lg shadow-sm`}
                >
                  #{kw}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black opacity-30 mb-2 uppercase tracking-[0.1em]">{t.notes}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.placeholderNotes}
              className={`w-full px-4 py-3 rounded-xl border border-transparent outline-none transition-all resize-none font-handwritten text-xl leading-relaxed
                 ${theme.bg} bg-opacity-20 focus:bg-opacity-60 focus:border-black/5
              `}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleToggleComplete}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all border active-scale
                ${goal.isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-gray-100 opacity-60'}
              `}
            >
              {goal.isCompleted ? (
                <CheckCircle2 size={20} className="animate-in zoom-in-50" />
              ) : (
                <Circle size={20} className="opacity-20" />
              )}
              <span className="font-black text-sm uppercase">
                {goal.isCompleted ? t.completed : t.markAsDone}
              </span>
            </button>

            <button
              onClick={handleRegister}
              className={`w-full flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black shadow-md active-scale text-base
                ${theme.solid} text-white
              `}
            >
              {t.saveEntry}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
