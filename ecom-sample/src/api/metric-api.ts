const BASE_URL = "/api/metric/";

export const getOrderItemMetricsByStatusAndDate = async(productType: string, status: string, startDate: string, endDate: string) => {
    try {
        const response = await fetch(BASE_URL + `orderitem/ptype/${productType}/status/${status}/sdate/${startDate}/edate/${endDate}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error};
    }
}