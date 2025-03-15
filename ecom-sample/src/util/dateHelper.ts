import dayjs, { Dayjs } from "dayjs";

dayjs.locale("en-sg"); //confirm if this changes locale globally

export const getStartOfDayjs = (date: Date) => {
    const day = dayjs(date);
    return day.set("second", 0).set("minute", 0).set("hour", 0);
}

export const getEndOfDayjs = (date: Date) => {
    const day = dayjs(date);
    return day.set("second", 59).set("minute", 59).set("hour", 23);
}

export const dayjsToString = (date: Dayjs) => {
    return date.format("YYYY-MM-DD HH:mm:ss");
}

export const getFormattedDate = (date: Date) => {
    return dayjsToString(dayjs(date));
}