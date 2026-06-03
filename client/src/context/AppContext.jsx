import axios from "axios";
import { createContext, useState } from "react";


export const AppContent = createContext();
axios.defaults.withCredentials = true;

export const AppContextProvider = (props)=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const getUserData = async()=>{
        console.log("Fetching user data...");
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`);
            if(data?.success){
                console.log("User data response:", data);
                setUserData(data.userData || null);
                setIsLoggedIn(true);
            }else{
                setUserData(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.log("Error fetching user data:", error);
            setUserData(null);
            setIsLoggedIn(false);
        }
    }
    
    const value = {
        userData,
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        setUserData,
        getUserData
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}