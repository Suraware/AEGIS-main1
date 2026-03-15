import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface CountryHoverTooltipProps {
    countryName: string | null;
    isVisible: boolean;
}

export const CountryHoverTooltip: React.FC<CountryHoverTooltipProps> = ({
    countryName,
    isVisible,
}) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!isVisible || !countryName) return null;

    return (
        <div
            className="pointer-events-none fixed bg-slate-900/95 border border-cyan-500/50 rounded-lg px-4 py-2 text-sm text-cyan-300 font-mono flex items-center gap-2 z-[99]"
            style={{
                left: `${mousePos.x + 20}px`,
                top: `${mousePos.y + 20}px`,
            }}
        >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{countryName}</span>
            <span className="text-slate-500 text-xs">Click for Maps</span>
        </div>
    );
};
