import { useBrandStore } from '@/store/useBrandStore';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

export function SocialPostTile() {
    const brand = useBrandStore((state) => state.brand);
    const { url } = brand.imagery || {};
    const { text, bg, primary } = brand.colors;
    const { text: logoText } = brand.logo;
    const { ui } = brand.typography;

    if (!url) return <div className="w-full h-full bg-gray-100" />;

    return (
        <div
            className="w-full h-full p-4 flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: bg }}
        >
            {/* Mock Phone/Card */}
            <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-sm border border-black/5">
                {/* Header */}
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: primary }}>
                            {logoText.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-black" style={{ fontFamily: ui }}>{logoText.toLowerCase()}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Sponsored</span>
                </div>

                {/* Image */}
                <div className="aspect-square w-full bg-gray-100 relative">
                    <img src={url} alt="Social" className="w-full h-full object-cover" />
                </div>

                {/* Actions */}
                <div className="p-3">
                    <div className="flex justify-between mb-2 text-black">
                        <div className="flex gap-3">
                            <Heart size={20} />
                            <MessageCircle size={20} />
                            <Send size={20} />
                        </div>
                        <Bookmark size={20} />
                    </div>
                    <p className="text-xs font-medium leading-tight text-black" style={{ fontFamily: ui }}>
                        <span className="font-bold mr-1">{logoText.toLowerCase()}</span>
                        Defining the new standard. #brand #design
                    </p>
                </div>
            </div>
        </div>
    );
}
