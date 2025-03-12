import { createContext, useContext, useState } from "react";

export interface ModalContextType {
    showCartModal: boolean;
    toggleShowCartModal: (flag: boolean) => void;
}

//Context to handle visibility/display of Modals within the app
const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider = ({ children } : any) => {
    const [showCartModal, setShowCartModal] = useState<boolean>(false);

    const toggleShowCartModal = (flag: boolean) => {
        setShowCartModal(flag);
    }

    return (
        <ModalContext.Provider value={{ 
            showCartModal, 
            toggleShowCartModal }}>
        {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
  return useContext(ModalContext);
};