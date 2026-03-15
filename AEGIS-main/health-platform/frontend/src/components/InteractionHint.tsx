import React, { useEffect, useState } from 'react';
import { MapPin, Info, Sparkles } from 'lucide-react';

interface InteractionHintProps {
    show: boolean;
}

export const InteractionHint: React.FC<InteractionHintProps> = ({ show }) => {
    const [visible, setVisible] = useState(show);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setVisible(show && !dismissed);
    }, [show, dismissed]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-24 left-6 z-40 max-w-xs animate-fade-in">
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-cyan-500/50 rounded-xl p-4 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            Interactive Globe
                        </h3>
                        <ul className="text-xs text-slate-300 space-y-1">
                            <li>🌍 Click any country to zoom in</li>
                            <li>📍 See facts & 3D terrain</li>
                            <li>🗺️ View satellite imagery</li>
                            <li>📍 Explore weather & data</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-slate-500 hover:text-slate-300 text-lg shrink-0"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};
