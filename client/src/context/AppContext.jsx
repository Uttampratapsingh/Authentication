import { useState } from "react";
import { createContext } from "react";


export const AppContext = createContext();

export const AppProvider = (props)=>{
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
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}