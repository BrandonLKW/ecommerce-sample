import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
//mui imports
import { Box, Button, FormControl, InputLabel, MenuItem, Typography, Select, SelectChangeEvent } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import CircularProgress from '@mui/material/CircularProgress';
//rechart imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
//api imports
import * as metricAPI from "../../api/metric-api"
//model imports
import { ProductType } from "../../models/Product";
//util imports
import { getStartOfDayjs, getEndOfDayjs, dayjsToString } from "../../util/dateHelper";
import { capitaliseFirstChar } from "../../util/stringHelper";
import "./MetricPage.css";

//https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
interface LooseObject {
    [key: string]: any
}

export default function MetricPage(){
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [selectedProductType, setSelectedProductType] = useState<string>(""); 
    const [selectedStartDate, setSelectedStartDate] = useState<Dayjs>(getStartOfDayjs(new Date()));
    const [selectedEndDate, setSelectedEndDate] = useState<Dayjs>(getEndOfDayjs(new Date()));
    const [chartData, setChartData] = useState<LooseObject[]>([]);
    const [yaxisList, setYaxisList] = useState<string[]>([]);

    const handleProductTypeChange = (event: SelectChangeEvent) => {
        setSelectedProductType(event.target.value);
    };

    const handleSearch = async () => {
        setShowLoading(true);
        try {
            if (!selectedProductType){
                return;
            }
            const response = await metricAPI.getOrderItemMetricsByStatusAndDate(
                selectedProductType.toUpperCase(), 
                "COMPLETED", 
                dayjsToString(selectedStartDate), 
                dayjsToString(selectedEndDate)
            );
            if (!response.error) {
                //Construct data object template first
                const uniqueNames: string[] = [];
                for (const item of response){
                    const incomingName = capitaliseFirstChar(item.name.toString())
                    if (item.name && !uniqueNames.includes(incomingName)){
                        uniqueNames.push(incomingName);
                    }
                }
                const dataObjectTemplate: LooseObject = {day:""};
                for (const name of uniqueNames){
                    dataObjectTemplate[name] = 0;
                }
                //Build array of data objects
                const data = []; 
                let startRange = selectedStartDate.set("second", 0).set("minute", 0).set("hour", 0);
                let endRange = selectedStartDate.set("second", 59).set("minute", 59).set("hour", 23);
                let hasValue = true;
                while (hasValue){
                    // https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
                    const dataObject = structuredClone(dataObjectTemplate); //build a new object for each day
                    dataObject["day"] = startRange.format("DD/MM")
                    for (const item of response){
                        //Check if within current range
                        const transactionDate = dayjs(item.completed_date);
                        if (transactionDate 
                            && transactionDate.isAfter(startRange)
                            && transactionDate.isBefore(endRange)){
                            try {
                                const calculateSum = parseInt(item.quantity) * parseFloat(item.unit_price);
                                dataObject[capitaliseFirstChar(item.name)] += calculateSum; 
                            } catch (error) {
                                throw error; //To handle error better, assume all correct for now
                            }
                        }
                    }
                    data.push(dataObject);
                    //Increase while loop count
                    startRange = startRange.add(1, "day");
                    endRange = endRange.add(1, "day");
                    if (startRange.isAfter(selectedEndDate)){
                        hasValue = false;
                    }
                }
                setChartData(data);
                setYaxisList(uniqueNames);
            } else {
                throw new Error(response.error);
            }
        } catch (error){
            console.log(error);
        }
        setShowLoading(false);
    }

    const generateRandomHexColour = () => {
        return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="metricspage">
                <div className="metricspageheader">
                    <Typography variant="h4">{`Metrics`}</Typography>
                </div>
                <div className="metricspagecol1">
                    <FormControl fullWidth>
                        <InputLabel id="ptype-label">{`Product Type`}</InputLabel>
                        <Select
                            labelId="ptype-label"
                            value={selectedProductType}
                            label="Product Type"
                            onChange={handleProductTypeChange}
                        >
                            {/* https://stackoverflow.com/questions/41308123/map-typescript-enum */}
                            {(Object.keys(ProductType) as Array<keyof typeof ProductType>).map((productType) => 
                                (<MenuItem key={productType} value={productType}>{`${productType}`}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>
                    <DateTimePicker
                        label="Start Date"
                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                        value={selectedStartDate}
                        onChange={(newValue: Dayjs | null) => {
                            if (newValue){
                                setSelectedStartDate(newValue);
                            }
                        }}
                    />
                    <DateTimePicker
                        label="End Date"
                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                        value={selectedEndDate}
                        onChange={(newValue: Dayjs | null) => {
                            if (newValue){
                                setSelectedEndDate(newValue);
                            }
                        }}
                    />
                    <Button variant="contained" onClick={handleSearch}>Search</Button>
                </div>
                <div className="metricspagecol2">
                    {showLoading 
                    ? 
                    <Box sx={{ display: showLoading ? "" : "none" }}>
                        <CircularProgress />
                    </Box>
                    : 
                    <>
                    {chartData.length > 0 
                    ? 
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={500}
                            height={300}
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" label={`Days`}/>
                            <YAxis label={`Cost ($)`}/>
                            <Tooltip />
                            <Legend />
                            {yaxisList.map((value) => {
                                return <Line type="monotone" dataKey={value} stroke={generateRandomHexColour()} activeDot={{ r: 8 }}/>
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                    : 
                    <Typography variant="h2">Choose filters and search!</Typography>
                    }
                    </>}
                </div>
            </div>
        </LocalizationProvider>
    )
}