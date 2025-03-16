import { createContext, useContext, useState } from "react";

export interface ModalContextType {
    showLoginModal: boolean;
    toggleShowLoginModal: (flag: boolean) => void;
    showSignupModal: boolean;
    toggleShowSignupModal: (flag: boolean) => void;
    showCartModal: boolean;
    toggleShowCartModal: (flag: boolean) => void;
    showMessageModal: boolean;
    toggleMessageModal: (flag: boolean, message: string, messageType: string) => void;
    message: string;
    messageType: string;
}

//Context to handle visibility/display of Modals within the app
const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider = ({ children } : any) => {
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
    const [showCartModal, setShowCartModal] = useState<boolean>(false);
    const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [messageType, setMessageType] = useState<string>("");

    const toggleShowLoginModal = (flag: boolean) => {
        setShowLoginModal(flag);
    }

    const toggleShowSignupModal = (flag: boolean) => {
        setShowSignupModal(flag);
    }

    const toggleShowCartModal = (flag: boolean) => {
        setShowCartModal(flag);
    }

    const toggleMessageModal = (flag: boolean, message: string, messageType: string) => {
        setShowMessageModal(flag)
        setMessage(message);
        setMessageType(messageType);
    }

    return (
        <ModalContext.Provider value={{ 
            showLoginModal,
            toggleShowLoginModal,
            showSignupModal,
            toggleShowSignupModal,
            showCartModal, 
            toggleShowCartModal,
            showMessageModal,
            toggleMessageModal, 
            message, 
            messageType}}>
        {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    return useContext(ModalContext);
};