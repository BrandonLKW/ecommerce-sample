import { useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import { Product } from "../../models/Product";
import "./ProductItem.css"

type ProductItemProps = {
    product: Product;
};

export default function ProductItem({ product } : ProductItemProps){

    useEffect(() => {
        //empty for now
    }, []);

    return (
        <Stack className="productitem" spacing={1}>
            <img height="200" width="200" src={product.image}/>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="h6">{`Unit Price: $${product.unit_price}`}</Typography>
            <Typography variant="h6">{`Available Quantity: ${product.quantity}`}</Typography>
        </Stack>
    );
}