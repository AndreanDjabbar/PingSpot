interface SettingCardProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({ title, icon: Icon, children }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon className="w-6 h-6 text-sky-800 mr-2" />
            {title}
        </h2>
        {children}
        </div>
    );
};

export default SettingCard;