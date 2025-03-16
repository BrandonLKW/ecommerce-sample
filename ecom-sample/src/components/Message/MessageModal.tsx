import { useEffect, useState } from "react";
//mui imports
import { Alert, Dialog } from "@mui/material"
//context imports
import { useModalContext } from "../../context/ModalContext";

export default function MessageModal(){
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [warningMsg, setWarningMsg] = useState<string>("");
    const { showMessageModal, toggleMessageModal, message, messageType} = useModalContext();

    useEffect(() => {
        resetWarnings();
        switch (messageType){
            case "SUCCESS":
                setShowSuccess(true);
                setSuccessMsg(message);
                break;
            case "WARNING":
                setShowWarning(true);
                setWarningMsg(message);
                break;
            case "ERROR":
                setShowError(true);
                setErrorMsg(message);
                break;
            default: //no display for unknown scenarios
                break;
        }
    }, [message]);

    const resetWarnings = () => {
        setShowError(false);
        setErrorMsg("");
        setShowSuccess(false);
        setSuccessMsg("");
        setShowWarning(false);
        setWarningMsg("");
    }

    return (
        <Dialog open={showMessageModal}
                onClose={() => {setTimeout(() => {toggleMessageModal(false, "", "")}, 1000)}} >
            <Alert severity="success" sx={{display: showSuccess ? "" : "none"}}>{successMsg}</Alert>
            <Alert severity="warning" sx={{display: showWarning ? "" : "none"}}>{warningMsg}</Alert>
            <Alert severity="error" sx={{display: showError ? "" : "none"}}>{errorMsg}</Alert>
        </Dialog>
    );
}