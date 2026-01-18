import React from 'react';
import { cn } from '@/lib/utils';
import { Square, Circle, Plus, Minus, X, HelpCircle } from 'lucide-react';
import { RavenCellData, RavenShape, RavenPosition } from '@/lib/raven-logic';

interface RavenCellProps {
    data: RavenCellData;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
}

export const RavenCell: React.FC<RavenCellProps> = ({ data, className, onClick, selected }) => {
    // 1. Handle Empty Cell (Question Mark)
    if (data.isEmpty) {
        return (
            <div className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-teal-500/30 bg-teal-500/5 flex items-center justify-center animate-pulse",
                className
            )}>
                <HelpCircle className="w-8 h-8 text-teal-500/50" />
            </div>
        );
    }

    // 2. Helper to get Icon Component
    const getShapeIcon = (shape: RavenShape) => {
        switch (shape) {
            case 'circle': return Circle;
            case 'square': return Square;
            case 'cross': return X; // Cross shape
            case 'line_horizontal': return Minus;
            case 'line_vertical': return Minus; // Will rotate 90deg
            default: return Circle;
        }
    };

    // 3. Helper to get Position Classes
    const getPositionClass = (pos: RavenPosition) => {
        switch (pos) {
            case 'center':
                return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
            case 'top_left':
                return "top-2 left-2";
            case 'bottom_right':
                return "bottom-2 right-2";
            default:
                return "";
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative aspect-square rounded-xl overflow-hidden transition-all duration-300",
                // Base Style
                "bg-slate-900 border border-slate-800 shadow-inner",
                // Interactive State (only if onClick is provided - i.e., Options)
                onClick && "cursor-pointer hover:border-teal-500 hover:bg-slate-800 hover:shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]",
                selected && "border-teal-400 ring-2 ring-teal-500/20 bg-teal-950/30",
                className
            )}
        >
            {/* Render Active Layers */}
            {data.layers.map((layer, index) => {
                if (!layer.mask) return null; // Skip inactive layers

                const ShapeIcon = getShapeIcon(layer.shape);
                const isVerticalObj = layer.shape === 'line_vertical';

                return (
                    <div
                        key={`${layer.shape}-${layer.position}-${index}`}
                        className={cn(
                            "absolute text-teal-500 mix-blend-screen", // Overlay effect
                            getPositionClass(layer.position)
                        )}
                    >
                        <ShapeIcon
                            size={layer.position === 'center' ? 40 : 24} // Center item larger
                            strokeWidth={2.5}
                            className={cn(
                                "fill-transparent", // Wireframe look mostly
                                isVerticalObj && "rotate-90"
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
};
