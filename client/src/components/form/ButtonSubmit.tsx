import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ButtonSubmitProps {
    className?: string;
    title: string;
    progressTitle?: string;
    isProgressing?: boolean;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ 
    className = 'group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300',
    title,
    progressTitle = `${title}...`,
    isProgressing = false
}) => {
    return (
        <button
            type="submit"
            className={className}
            disabled={isProgressing}
        >
            {isProgressing && (
                <AiOutlineLoading3Quarters className="animate-spin mr-2 text-lg" />
            )}
            <span>{isProgressing ? progressTitle : title}</span>
        </button>
    );
};

export default ButtonSubmit;