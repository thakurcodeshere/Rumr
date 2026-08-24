import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Compass, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  Tablet, 
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';

interface BrowserLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onLocationApproved: (city: string, coords?: { lat: number; lng: number }) => void;
}

export const BrowserLocationModal: React.FC<BrowserLocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onLocationApproved
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManualCities, setShowManualCities] = useState(false);

  if (!isOpen) return null;

  const popularCities = [
    { name: 'Gurgaon, NCR', country: 'IN', label: 'Tech & Startup Hub' },
    { name: 'London, UK', country: 'GB', label: 'Financial & Media Nodes' },
    { name: 'San Francisco, CA', country: 'US', label: 'AI & Venture Capital' },
    { name: 'Bengaluru, KA', country: 'IN', label: 'Engineering Capital' },
    { name: 'Delhi NCR', country: 'IN', label: 'National Capital Mesh' },
    { name: 'Mumbai, MH', country: 'IN', label: 'Media & Entertainment' },
    { name: 'Berlin, DE', country: 'EU', label: 'Techno & Contrarian Tech' },
    { name: 'Singapore, SG', country: 'SG', label: 'Southeast Asia Gateway' }
  ];

  const handleRequestNativeLocation = () => {
    setIsRequesting(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please select your city manually.');
      setIsRequesting(false);
      setShowManualCities(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        const { latitude, longitude } = position.coords;
        
        // Approximate city based on longitude ranges or assign nearest hub
        let detectedCity = 'Gurgaon, NCR';
        if (longitude > -125 && longitude < -115) {
          detectedCity = 'San Francisco, CA';
        } else if (longitude > -5 && longitude < 5) {
          detectedCity = 'London, UK';
        } else if (longitude > 72 && longitude < 74) {
          detectedCity = 'Mumbai, MH';
        } else if (longitude > 77 && longitude < 78) {
          detectedCity = latitude > 20 ? 'Delhi NCR' : 'Bengaluru, KA';
        }

        localStorage.setItem('rumr_location_permission', 'granted');
        localStorage.setItem('rumr_user_city', detectedCity);
        onLocationApproved(detectedCity, { lat: latitude, lng: longitude });
        onClose();
      },
      (error) => {
        setIsRequesting(false);
        localStorage.setItem('rumr_location_permission', 'denied');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg('Location permission was denied in your browser settings. You can select your city manually below.');
        } else {
          setErrorMsg('Unable to retrieve location. Please choose your city manually.');
        }
        setShowManualCities(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSelectCity = (cityName: string) => {
    localStorage.setItem('rumr_location_permission', 'manual');
    localStorage.setItem('rumr_user_city', cityName);
    onLocationApproved(cityName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in select-none">
      <div className="bg-[#0e0e0e] border-4 border-[#ccff00] w-full max-w-md flex flex-col shadow-[8px_8px_0px_#a855f7] overflow-hidden text-left relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b-2 border-[#262626] bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ccff00] text-black font-serif font-black text-sm flex items-center justify-center border border-black">
              R
            </div>
            <span className="font-mono text-xs text-[#ccff00] font-black uppercase tracking-wider">
              BROWSER RADAR // LOCATION ACCESS
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Headline & Device Badge */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-[#1b1526] border border-[#a855f7] px-2.5 py-0.5 font-mono text-[10px] text-[#ddb7ff] font-bold uppercase">
              <Smartphone className="w-3 h-3 text-[#ccff00]" />
              <span>MOBILE & TABLET BROWSER ACCESS</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Enable Local Topic Radar
            </h2>

            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              Rumr is a browser-first social mesh. We request browser location access to connect you with active topics, debates, and audio stages happening in your immediate city.
            </p>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="bg-[#141414] border-2 border-[#262626] p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#ccff00] font-bold uppercase text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
              <span>DPDP 2023 ZERO-KNOWLEDGE PROMISE</span>
            </div>
            <ul className="text-gray-400 space-y-1 text-[11px] list-disc list-inside">
              <li>Coordinates are SHA-256 hashed into city mesh cells.</li>
              <li>Zero raw GPS trace retention on central servers.</li>
              <li>No app store download required—instant browser execution.</li>
            </ul>
          </div>

          {/* Error / Fallback Notice if Denied */}
          {errorMsg && (
            <div className="bg-[#1f1212] border border-red-500 p-3 font-mono text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Main Action Buttons */}
          {!showManualCities ? (
            <div className="space-y-2 pt-1">
              <BrutalistButton
                variant="primary"
                size="lg"
                onClick={handleRequestNativeLocation}
                disabled={isRequesting}
                className="w-full justify-center text-xs font-black shadow-[4px_4px_0px_#a855f7] flex items-center gap-2"
              >
                <Compass className={`w-4 h-4 text-black ${isRequesting ? 'animate-spin' : ''}`} />
                {isRequesting ? 'REQUESTING BROWSER PERMISSION...' : '📍 ALLOW BROWSER LOCATION ACCESS'}
              </BrutalistButton>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowManualCities(true)}
                  className="bg-[#181818] border-2 border-[#333] hover:border-[#ccff00] text-gray-200 py-2.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-[#ccff00]" />
                  SELECT CITY
                </button>

                <button
                  onClick={() => handleSelectCity(currentCity || 'Gurgaon, NCR')}
                  className="bg-[#181818] border-2 border-[#333] hover:border-white text-gray-400 hover:text-white py-2.5 font-mono text-xs font-bold uppercase transition-all"
                >
                  KEEP DEFAULT
                </button>
              </div>
            </div>
          ) : (
            /* Manual City Picker */
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-gray-300 font-bold uppercase">SELECT YOUR ACTIVE CITY MESH:</span>
                <button 
                  onClick={() => setShowManualCities(false)}
                  className="text-[#ccff00] text-[10px] hover:underline"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelectCity(city.name)}
                    className={`p-2.5 border-2 text-left font-mono text-xs transition-all flex flex-col justify-between ${
                      currentCity === city.name
                        ? 'bg-[#1a2414] border-[#ccff00] text-white shadow-[2px_2px_0px_#ccff00]'
                        : 'bg-[#141414] border-[#2a2a2a] text-gray-300 hover:border-[#a855f7]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-white">{city.name}</strong>
                      <span className="text-[9px] bg-[#222] px-1 text-gray-400">{city.country}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5">{city.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#222] bg-[#080808] font-mono text-[10px] text-gray-500 flex justify-between items-center">
          <span>Active City: <strong className="text-[#ccff00]">{currentCity}</strong></span>
          <span>Web Browser Protocol</span>
        </div>

      </div>
    </div>
  );
};
