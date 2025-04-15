interface DialogItemProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    enabled?: boolean;
}

export const DialogItem = ({
    onClick,
    children,
    className,
    enabled = true,
}: DialogItemProps) => {
    const ClickHandler = () => {
        if (enabled) {
            onClick?.();
        }
    };

    return (
        <div
            onClick={ClickHandler}
            className={`${className} bg-carnage-blue-medium rounded-lg pointer-events-auto hover:bg-carnage-blue-light transition-colors ${
                enabled ? "opacity-100" : "opacity-50"
            } ${enabled ? "cursor-pointer" : "cursor-not-allowed"}`}
        >
            {children}
        </div>
    );
};
