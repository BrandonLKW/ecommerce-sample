export const capitaliseFirstChar = (inputStr: string) => {
    return inputStr.charAt(0).toUpperCase() + inputStr.toLowerCase().slice(1);
}