import { useEffect, useState } from "react";
import { Product } from "../../models/Product";
import ProductItem from "../../components/ProductItem/ProductItem";
import * as productAPI from "../../api/product/product-api";
import "./ProductPage.css";
import { Button } from "@mui/material";
import CartModal from "../../components/Modal/CartModal";
import { useModalContext } from "../../context/ModalContext";

export default function ProductPage(){
    const [productList, setProductList] = useState<Product[]>([]);
    // const [displayModal, setDisplayModal] = useState<boolean>(false);
    const { toggleShowCartModal } = useModalContext();

    useEffect(() => {
        const loadProducts = async () => {
            const response = await productAPI.getAllProducts();
            if (response){
                const results = [];
                for (const item of response){
                    results.push(new Product(item));
                }
                setProductList(results);
            }
        }
        loadProducts();
    }, []);

    return (
    <div className="productpagecol2">
        <Button variant="outlined" size="large" onClick={() => toggleShowCartModal(true)}/> 
        <CartModal />
        {productList?.map((product) => (<ProductItem product={product}/>))}
    </div>
    );
}