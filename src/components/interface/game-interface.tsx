import { setState, useIsHost } from "playroomkit";

const GameInterface = () => {
    const amHost = useIsHost();

    const handleLeave = () => {
        if (amHost) {
            setState("inGame", false);
        }
        window.location.reload();
    };


    return (
        <div className="fixed inset-0 pointer-events-none select-none">
            <div className="absolute right-4 top-4">
                <button
                    className="bg-carnage-blue-medium rounded-lg p-4 pointer-events-auto cursor-pointer"
                    onClick={handleLeave}
                >
                    Leave
                </button>
            </div>
        </div>
    );
};

export default GameInterface;
