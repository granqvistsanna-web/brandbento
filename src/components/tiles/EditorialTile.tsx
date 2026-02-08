import { useBrandStore } from '@/store/useBrandStore';

export function EditorialTile() {
    const brand = useBrandStore((state) => state.brand);
    const { primary, secondary, weightHeadline } = brand.typography;
    const { text: textColor, bg } = brand.colors;

    return (
        <div
            className="w-full h-full p-8 flex flex-col justify-center gap-6 relative overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: bg }}
        >
            <h1
                className="text-4xl leading-[0.9] tracking-tight"
                style={{
                    fontFamily: primary,
                    fontWeight: parseInt(weightHeadline) || 700,
                    color: textColor
                }}
            >
                The Future <br />
                <span className="opacity-40">Is Created.</span>
            </h1>

            <div className="w-12 h-1 bg-current opacity-20" style={{ color: textColor }} />

            <p
                className="text-sm max-w-[20ch] opacity-80"
                style={{
                    fontFamily: secondary,
                    color: textColor
                }}
            >
                We build digital experiences that matter. Quality over quantity, always.
            </p>
        </div>
    );
}
