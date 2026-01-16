interface ToggleSwitchProps {
    enabled: boolean;
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => {
    return (
        <button
        type="button"
        onClick={onChange}
        className={`${
            enabled ? 'bg-sky-800' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
        <span className="sr-only">{enabled ? 'Enable' : 'Disable'}</span>
        <span
            className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
        </button>
    );
};

export default ToggleSwitch;