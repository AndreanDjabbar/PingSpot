import { BiMenu } from "react-icons/bi";
import PingspotLogo from "./PingspotLogo";

interface TopNavigationProps {
    onMenuToggle: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuToggle }) => {
    return (
        <div className="lg:hidden bg-pingspot-gradient shadow-md">
            <div className="flex items-center justify-between px-4 py-3">
                <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                    <BiMenu className="w-6 h-6 text-gray-300" />
                </button>
                
                <div className="backdrop-blur-md bg-white/20 border border-white rounded-xl shadow-lg flex justify-center">
                    <div>
                        <PingspotLogo size="120" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopNavigation;