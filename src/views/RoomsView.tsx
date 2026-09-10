import React from 'react';
import { useApp } from '../lib/store';
import { BrutalistCard } from '../components/ui/BrutalistCard';
import { BrutalistBadge } from '../components/ui/BrutalistBadge';
import { BrutalistButton } from '../components/ui/BrutalistButton';
import { Radio, Mic, MicOff, Volume2, Users, ArrowLeft, Send } from 'lucide-react';
import { TopicRoom } from '../types';

export const RoomsView: React.FC = () => {
  const { rooms, activeAudioRoom, joinRoom, leaveRoom, isMicActive, toggleMic, sendChatMessage, isGuest, triggerGuestLock } = useApp();
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
              <span className="font-mono text-[10px] text-[#ccff00] font-bold uppercase">BROADCASTING</span>
            </div>
            <h2 className="font-serif text-2xl font-black text-white">{activeAudioRoom.title}</h2>
            <div className="flex items-center gap-4 mt-2 font-mono text-xs text-gray-300">
              <span>Speakers: {activeAudioRoom.activeSpeakers}</span>
              <span>Listeners: {activeAudioRoom.listeners + 1}</span>
            </div>
          </div>

          {/* Speaker Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#141414] border-2 border-[#ccff00] p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ccff00] text-black font-mono font-bold flex items-center justify-center text-sm">
                HOST
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-white">{activeAudioRoom.hostHandle}</div>
                <div className="font-mono text-[10px] text-[#ccff00]">Speaking (Live)</div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#333] p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#a855f7] text-black font-mono font-bold flex items-center justify-center text-sm">
                YOU
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-white">anonymous_ghost_42</div>
                <div className="font-mono text-[10px] text-gray-400">{isMicActive ? 'Speaking' : 'Muted'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Audio Controls & Chat */}
        <div className="space-y-3 pt-3 border-t border-[#262626]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={toggleMic}
              className={`flex-1 py-3 px-4 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 transition-all ${
                isMicActive 
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[2px_2px_0px_#a855f7]' 
                  : 'bg-[#1a1a1a] text-gray-300 border-[#444] hover:text-white'
              }`}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
              {isMicActive ? 'Mic Active (Live)' : 'Unmute Mic'}
            </button>

            <button
              onClick={leaveRoom}
              className="py-3 px-4 bg-red-900/30 border border-red-500 text-red-300 font-mono text-xs font-bold uppercase hover:bg-red-900/50"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Rooms Directory
  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-[#ccff00]" />
          <BrutalistBadge variant="lime">LIVE TOPIC AUDIO ROOMS</BrutalistBadge>
        </div>
        <h2 className="font-serif text-2xl font-black text-white">Encrypted Voice Pods</h2>
        <p className="font-mono text-xs text-gray-400">Anonymous drop-in voice rooms organized by topic chaos.</p>
      </div>

      <div className="space-y-4">
        {rooms.map(room => (
          <BrutalistCard key={room.id} isHot={room.isLive} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BrutalistBadge variant={room.isLive ? 'lime' : 'grey'}>
                    {room.category}
                  </BrutalistBadge>
                  {room.isLive && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#ccff00] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" /> LIVE NOW
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-white">{room.title}</h3>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-white flex items-center gap-1 justify-end">
                  <Users className="w-3.5 h-3.5 text-[#ccff00]" /> {room.listeners}
                </div>
                <div className="font-mono text-[9px] text-gray-500 uppercase">Listening</div>
              </div>
            </div>

            <p className="font-mono text-xs text-gray-300 bg-[#141414] p-2.5 border-l-2 border-[#a855f7]">
              Current debate: "{room.recentDebate}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#222]">
              <span className="font-mono text-[10px] text-gray-400">
                Host: <strong className="text-white">{room.hostHandle}</strong>
              </span>

              <BrutalistButton
                variant="primary"
                size="sm"
                onClick={() => {
                  if (isGuest) {
                    triggerGuestLock('Live Audio Room', 'Guest users cannot enter live audio debates or speak. Create an account with your email to join the stage.');
                    return;
                  }
                  joinRoom(room);
                }}
                className="flex items-center gap-1"
              >
                <Radio className="w-3.5 h-3.5 text-black" />
                Drop In Audio
              </BrutalistButton>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
};
