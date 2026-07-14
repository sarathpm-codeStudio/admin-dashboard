import { Monitor, MoreVertical } from 'lucide-react'
import logo from '@/asset/icons/brand_icon.svg'

/**
 * Full-screen overlay shown only on phone-sized screens (below the `md`
 * breakpoint, i.e. < 768px). The dashboard is designed for tablet and laptop,
 * so on mobile we ask the user to switch their browser to "Desktop site".
 * Tablets (≥ 768px) and laptops never see this — it's hidden at `md` and up.
 */
const MobileBlocker = () => {
    return (
        <div className="md:hidden fixed inset-0 z-[9999] bg-[#2c1452] flex flex-col items-center justify-center text-center px-6">
            <img src={logo} alt="logo" className="w-16 h-16 object-contain mb-6" />

            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                <Monitor size={30} className="text-white" />
            </div>

            <h1 className="text-white text-xl font-bold mb-2">Desktop View Required</h1>

            <p className="text-blue-200 text-sm leading-relaxed max-w-xs mb-6">
                This dashboard is optimized for tablet and laptop screens. Please open it
                on a larger device, or switch your mobile browser to desktop view.
            </p>

            <div className="bg-white/10 rounded-xl px-4 py-3 max-w-xs">
                <p className="text-white text-xs font-semibold mb-1 flex items-center justify-center gap-1.5">
                    Tap the menu <MoreVertical size={14} className="inline" /> in your browser
                </p>
                <p className="text-blue-200 text-xs leading-relaxed">
                    then enable <span className="font-bold text-white">"Desktop site"</span> to continue.
                </p>
            </div>
        </div>
    )
}

export default MobileBlocker
