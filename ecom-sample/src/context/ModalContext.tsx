import { createContext, useContext, useState } from "react";

export interface ModalContextType {
    showLoginModal: boolean;
    toggleShowLoginModal: (flag: boolean) => void;
    showSignupModal: boolean;
    toggleShowSignupModal: (flag: boolean) => void;
    showCartModal: boolean;
    toggleShowCartModal: (flag: boolean) => void;
}

//Context to handle visibility/display of Modals within the app
const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider = ({ children } : any) => {
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
    const [showCartModal, setShowCartModal] = useState<boolean>(false);

    const toggleShowLoginModal = (flag: boolean) => {
        setShowLoginModal(flag);
    }

    const toggleShowSignupModal = (flag: boolean) => {
        setShowSignupModal(flag);
    }

    const toggleShowCartModal = (flag: boolean) => {
        setShowCartModal(flag);
    }

    return (
        <ModalContext.Provider value={{ 
            showLoginModal,
            toggleShowLoginModal,
            showSignupModal,
            toggleShowSignupModal,
            showCartModal, 
            toggleShowCartModal }}>
        {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
  return useContext(ModalContext);
};