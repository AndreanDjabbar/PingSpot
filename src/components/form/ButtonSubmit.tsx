import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";

interface ButtonSubmitProps {
    className?: string;
    title: string;
    progressTitle?: string;
    fullWidth?: boolean;
    isProgressing?: boolean;
    disabled?: boolean;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ 
    className,
    title,
    fullWidth = false,
    progressTitle = `${title}...`,
    isProgressing = false,
    disabled = false,
}) => {
    const isDisabled = isProgressing || disabled;
    
    return (
        <button
            type="submit"
            className={cn(
                "group relative flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300 hover:cursor-pointer",
                isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-sky-700 hover:bg-sky-800", fullWidth ? "w-full" : "",
                className
            )}
            disabled={isDisabled}
        >
            {isProgressing && (
                <AiOutlineLoading3Quarters className="animate-spin mr-2 text-lg" />
            )}
            <span>{isProgressing ? progressTitle : title}</span>
        </button>
    );
};

export default ButtonSubmit;