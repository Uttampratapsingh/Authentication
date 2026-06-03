import { useState } from "react";
import { createContext } from "react";


export const AppContent = createContext();

export const AppContextProvider = (props)=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    
    const value = {
        userData,
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        setUserData
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}