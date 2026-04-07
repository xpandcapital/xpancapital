'use client';

import { useState, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  duration: string;
}

interface CourseProgressProps {
  courseId: string;
  modules: Module[];
}

export default function CourseProgress({ courseId, modules }: CourseProgressProps) {
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const storageKey = `course_progress_${courseId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedModules(parsed);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
    setIsLoaded(true);
  }, [courseId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const storageKey = `course_progress_${courseId}`;
      localStorage.setItem(storageKey, JSON.stringify(completedModules));
    }
  }, [completedModules, courseId, isLoaded]);

  const toggleModule = (moduleId: string) => {
    setCompletedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const resetProgress = () => {
    setCompletedModules([]);
  };

  const progressPercentage = Math.round(
    (completedModules.length / modules.length) * 100
  );

  if (!isLoaded) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-white/10 rounded-full mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">
            Progreso del Curso
          </h3>
          <span className="text-white font-black text-xl">
            {progressPercentage}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-white/60 text-xs">
            {completedModules.length} de {modules.length} módulos completados
          </p>
          {completedModules.length > 0 && (
            <button
              onClick={resetProgress}
              className="text-white/40 hover:text-white/80 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Modules checklist */}
      <div className="space-y-2">
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          
          return (
            <label
              key={module.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer
                transition-all duration-200 group
                ${isCompleted 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                }
              `}
            >
              {/* Custom checkbox */}
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isCompleted 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-white/30 group-hover:border-white/50'
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  toggleModule(module.id);
                }}
              >
                {isCompleted && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Hidden actual checkbox for accessibility */}
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleModule(module.id)}
                className="sr-only"
              />

              {/* Module info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs font-bold uppercase tracking-wider
                    ${isCompleted ? 'text-emerald-400' : 'text-white/40'}
                  `}>
                    Módulo {index + 1}
                  </span>
                  <span className="text-white/30 text-xs">•</span>
                  <span className="text-white/50 text-xs">{module.duration}</span>
                </div>
                <p className={`
                  font-medium text-sm mt-0.5 truncate
                  ${isCompleted ? 'text-white/60 line-through' : 'text-white'}
                `}>
                  {module.title}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Completion message */}
      {progressPercentage === 100 && (
        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-emerald-400 font-black text-sm uppercase tracking-wider text-center">
            ¡Felicitaciones! Has completado el curso
          </p>
        </div>
      )}
    </div>
  );
}
