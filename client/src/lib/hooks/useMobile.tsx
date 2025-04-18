import { useState } from "react";
import { useEffect } from "react";

const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return { isMobile };
};

export default useMobile;
