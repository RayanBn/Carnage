interface PanelItemProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

export const PanelItem = ({ onClick, children, className }: PanelItemProps) => {
    return (
        <div
            onClick={onClick}
            className={`${className} w-56 h-24 bg-carnage-blue-dark rounded-lg p-2 pointer-events-auto`}
        >
            <div className="w-full h-full relative cursor-pointer">{children}</div>
        </div>
    );
};
