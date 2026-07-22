import React, { useState } from 'react';
import { TargetRole } from '../types';
import { ROLE_DEFINITIONS } from '../data/sampleData';
import { Check, Sparkles, Building2, Code, Database, Globe, Cloud, Briefcase } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: TargetRole;
  onSelectRole: (role: TargetRole, customRoleName?: string) => void;
  customRoleName?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  customRoleName = '',
}) => {
  const [customInput, setCustomInput] = useState(customRoleName);
  const [showCustomModal, setShowCustomModal] = useState(selectedRole === 'Custom');

  const getRoleIcon = (role: TargetRole) => {
    switch (role) {
      case 'SDE':
        return <Code className="w-5 h-5 text-indigo-400" />;
      case 'Web Developer':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'Data Analyst':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'DevOps / Cloud':
        return <Cloud className="w-5 h-5 text-amber-400" />;
      case 'Product Manager':
        return <Briefcase className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Select Target Interview Role</span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
              Step 1 of 2
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            AI customizes question difficulty, technical domain depth, and evaluation rubrics based on your selected placement role.
          </p>
        </div>
      </div>

      {/* Role Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLE_DEFINITIONS.map((item) => {
          const isSelected = selectedRole === item.role;
          return (
            <div
              key={item.role}
              id={`role-card-${item.role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectRole(item.role)}
              className={`group relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/40'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-indigo-500 text-white shadow">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                    {getRoleIcon(item.role)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {item.role}
                    </h3>
                    <p className="text-xs text-slate-400">{item.title}</p>
                  </div>
                </div>

                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.badge}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Skills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.keySkills.slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-900/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                  {item.keySkills.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{item.keySkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[150px]">
                    {item.targetCompanies.slice(0, 3).join(', ')}
                  </span>
                </div>
                <span className="font-mono text-indigo-400">{item.avgDifficulty}</span>
              </div>
            </div>
          );
        })}

        {/* Custom Role Option */}
        <div
          id="role-card-custom"
          onClick={() => {
            setShowCustomModal(true);
            onSelectRole('Custom', customInput || 'QA Automation Engineer');
          }}
          className={`group relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedRole === 'Custom'
              ? 'bg-slate-800/90 border-indigo-500 shadow-lg ring-2 ring-indigo-500/40'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
          }`}
        >
          {selectedRole === 'Custom' && (
            <div className="absolute top-3 right-3 p-1 rounded-full bg-indigo-500 text-white shadow">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  Custom Role
                </h3>
                <p className="text-xs text-slate-400">Specify any specialized job title</p>
              </div>
            </div>

            <div className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              🛠️ Flexible Domain
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Targeting QA, Cybersecurity, AI/ML Specialist, System Admin, or Solution Architect?
            </p>

            {selectedRole === 'Custom' && (
              <div className="mt-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    onSelectRole('Custom', e.target.value);
                  }}
                  placeholder="e.g. AI / ML Engineer"
                  className="w-full bg-slate-900 border border-indigo-500/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/40 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>Tailors questions automatically</span>
            <span className="font-mono">Adaptive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
