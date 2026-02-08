import { useBrandStore } from '@/store/useBrandStore';
import { MousePointer2, ArrowRight } from 'lucide-react';

export function InterfaceTile() {
    const brand = useBrandStore((state) => state.brand);
    const { primary, text, bg, surface } = brand.colors;
    const { secondary: bodyFont } = brand.typography;

    // Use bg color for better contrast with primary buttons
    const bgColor = bg;

    return (
        <div
            className="w-full h-full p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: bgColor }}
        >
            {/* Primary Button */}
            <div className="w-full max-w-[200px] group relative z-10">
                <button
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                    style={{
                        backgroundColor: primary,
                        color: bg,
                        fontFamily: bodyFont,
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}
                >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                </button>
            </div>

            {/* Secondary Button */}
            <div className="w-full max-w-[200px] z-10">
                <button
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all duration-200 hover:bg-black/5 active:scale-[0.98]"
                    style={{
                        borderColor: text,
                        color: text,
                        fontFamily: bodyFont,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        opacity: 0.8
                    }}
                >
                    <span>View Details</span>
                </button>
            </div>


        </div>
    );
}
