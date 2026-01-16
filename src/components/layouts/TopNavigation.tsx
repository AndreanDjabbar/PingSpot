import { BiMenu } from "react-icons/bi";
import PingspotLogo from "../UI/PingspotLogo";

interface TopNavigationProps {
    onMenuToggle: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuToggle }) => {
    return (
        <div className="xl:hidden bg-pingspot">
            <div className="flex items-center justify-between px-4 py-3">
                <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                    <BiMenu className="w-6 h-6 text-gray-300" />
                </button>
                
                <PingspotLogo size="150" type="secondary"/>
            </div>
        </div>
    )
}

export default TopNavigation;