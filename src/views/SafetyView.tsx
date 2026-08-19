import React, { useState } from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Shield, ShieldAlert, Lock, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';

export const SafetyView: React.FC = () => {
  const { reportContent, triggerNudge } = useApp();
  const [reportReason, setReportReason] = useState('Doxxing / Personal Identifiers');
  const [reportTarget, setReportTarget] = useState('rumor-1');

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportContent(reportTarget, reportReason);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <BrutalistBadge variant="lime">SECURITY // ZERO COMPROMISE</BrutalistBadge>
        <h2 className="font-serif text-2xl font-black text-white mt-1">Safety & Moderation</h2>
        <p className="font-mono text-xs text-gray-400">Cryptographic privacy protocols and real-time AI Sentinel</p>
      </div>

      {/* Safety Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#141414] border border-[#2a2a2a] p-4 space-y-2">
          <Lock className="w-5 h-5 text-[#ccff00]" />
          <h3 className="font-serif text-base font-bold text-white">Ephemeral Storage</h3>
          <p className="font-sans text-xs text-gray-400">
            Messages automatically vaporize after topic timer expires. No persistent chat logs.
          </p>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] p-4 space-y-2">
          <EyeOff className="w-5 h-5 text-[#a855f7]" />
          <h3 className="font-serif text-base font-bold text-white">Zero Doxxing Guarantee</h3>
          <p className="font-sans text-xs text-gray-400">
            AI Sentinel detects and prevents phone numbers, full names, or company IDs before sending.
          </p>
        </div>
      </div>

      {/* AI Toxicity Sentinel Simulation */}
      <BrutalistCard className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-white">AI Sentinel Testing Sandbox</h3>
          <BrutalistBadge variant="purple">LIVE MONITOR</BrutalistBadge>
        </div>
        <p className="font-sans text-xs text-gray-400">
          Try triggering the real-time moderation guardrails to see how hostile patterns are corrected without censorship of debate topics.
        </p>
        <BrutalistButton 
          variant="secondary" 
          size="sm"
          onClick={() => triggerNudge('Simulation: Ad-hominem behavior detected. Maintain topic-centered friction.')}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Test Toxicity Guardrail
        </BrutalistButton>
      </BrutalistCard>

      {/* Anonymous Report Form */}
      <BrutalistCard className="space-y-3">
        <h3 className="font-serif text-base font-bold text-white">File Cryptographic Report</h3>
        <p className="font-mono text-xs text-gray-400">
          Reports are encrypted and voted on by community quorum.
        </p>

        <form onSubmit={handleReport} className="space-y-3">
          <div>
            <label className="font-mono text-xs text-[#ccff00] font-bold block mb-1">VIOLATION TYPE</label>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] p-2.5 font-mono text-xs text-white outline-none"
            >
              <option value="Doxxing / Personal Identifiers">Doxxing / Personal Identifiers</option>
              <option value="Targeted Harassment">Targeted Harassment</option>
              <option value="Commercial Spam / Bot Swarm">Commercial Spam / Bot Swarm</option>
              <option value="Illegal Content">Illegal Content</option>
            </select>
          </div>

          <BrutalistButton variant="primary" size="sm" type="submit">
            Submit Anonymous Report
          </BrutalistButton>
        </form>
      </BrutalistCard>
    </div>
  );
};
