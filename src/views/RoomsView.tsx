import React from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Radio, Mic, MicOff, Volume2, Users, ArrowLeft, Send } from 'lucide-react';
import { TopicRoom } from '../types';

export const RoomsView: React.FC = () => {
  const { rooms, activeAudioRoom, joinRoom, leaveRoom, isMicActive, toggleMic, sendChatMessage } = useApp();
  const [chatInput, setChatInput] = React.useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  // If currently inside an active audio room
  if (activeAudioRoom) {
    return (
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
            <button 
              onClick={leaveRoom}
              className="font-mono text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Room
            </button>
            <BrutalistBadge variant="lime">LIVE ENCRYPTED AUDIO</BrutalistBadge>
          </div>

          {/* Room Banner */}
          <div className="bg-[#181424] border-2 border-[#a855f7] p-4 mb-4 shadow-[4px_4px_0px_#ccff00]">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-[#ccff00] animate-pulse" />
              <span className="font-mono text-[10px] text-[#ccff00] font-bold uppercase">{activeAudioRoom.category}</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white">{activeAudioRoom.title}</h2>
            <p className="font-mono text-xs text-gray-400 mt-1">
              Moderator: <span className="text-[#a855f7]">{activeAudioRoom.hostHandle}</span> • {activeAudioRoom.listeners} Anonymous Listeners
            </p>
          </div>

          {/* Speaker Podium Grid */}
          <div className="space-y-2 mb-4">
            <div className="font-mono text-xs text-gray-400 font-bold">SPEAKERS ON STAGE</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: activeAudioRoom.hostHandle, role: 'Host', isSpeaking: true },
                { name: 'matrix_hacker', role: 'Speaker', isSpeaking: false },
                { name: 'ghost_philosopher', role: 'Speaker', isSpeaking: true },
                { name: 'You (Anonymous)', role: 'Listener', isSpeaking: isMicActive }
              ].map((sp, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 border ${sp.isSpeaking ? 'border-[#ccff00] bg-[#1a2014]' : 'border-[#262626] bg-[#141414]'} flex flex-col items-center justify-center text-center`}
                >
                  <div className={`w-10 h-10 border-2 ${sp.isSpeaking ? 'border-[#ccff00] bg-[#ccff00]/20' : 'border-gray-600 bg-gray-800'} flex items-center justify-center font-mono font-bold text-xs mb-1.5`}>
                    {sp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="font-mono text-[11px] text-white font-bold truncate max-w-full">{sp.name}</div>
                  <div className="font-mono text-[9px] text-[#a855f7]">{sp.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Controls & In-Room Chat */}
        <div className="border-t border-[#262626] pt-3 space-y-3">
          <div className="flex items-center justify-between bg-[#141414] border border-[#333] p-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#ccff00]" />
              <span className="font-mono text-xs text-gray-300">Spatial Audio Enabled</span>
            </div>
            <BrutalistButton 
              variant={isMicActive ? 'danger' : 'primary'} 
              size="sm"
              onClick={toggleMic}
            >
              {isMicActive ? <><MicOff className="w-3.5 h-3.5" /> Mute</> : <><Mic className="w-3.5 h-3.5" /> Request Mic</>}
            </BrutalistButton>
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Send anonymous room reaction..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-[#161616] border border-[#333] px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#ccff00]"
            />
            <BrutalistButton variant="primary" size="sm" type="submit">
              <Send className="w-3.5 h-3.5 text-black" />
            </BrutalistButton>
          </form>
        </div>
      </div>
    );
  }

  // Room Discovery List
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-black text-white">Topic Rooms</h2>
        <p className="font-mono text-xs text-gray-400">Live anonymous voice & text discussion spaces</p>
      </div>

      <div className="space-y-3">
        {rooms.map(room => (
          <BrutalistCard key={room.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                <BrutalistBadge variant="purple">{room.category}</BrutalistBadge>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-gray-400">
                <Users className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>{room.listeners} Listening</span>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-white">{room.title}</h3>
              <p className="font-sans text-xs text-gray-400 mt-1 italic border-l border-gray-700 pl-2">
                "{room.recentDebate}"
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#222]">
              <div className="font-mono text-[11px] text-gray-500">
                Host: <span className="text-white">{room.hostHandle}</span>
              </div>
              <BrutalistButton variant="primary" size="sm" onClick={() => joinRoom(room)}>
                <Radio className="w-3 h-3 text-black" /> Drop In
              </BrutalistButton>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};
