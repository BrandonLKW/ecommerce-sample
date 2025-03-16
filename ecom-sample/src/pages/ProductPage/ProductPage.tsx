import { useEffect, useState } from "react";
//mui imports
import { Button, List, ListItemButton, ListItemText, Typography } from "@mui/material";
//api imports
import * as productAPI from "../../api/product-api";
//model imports
import { Product, ProductType } from "../../models/Product";
//custom component imports
import ProductItem from "../../components/Product/ProductItem";
import AddProductModal from "../../components/Product/AddProductModal";
//context imports
import { useCartContext } from "../../context/CartContext";
//util imports
import * as stringHelper from "../../util/stringHelper";
import "./ProductPage.css";


export default function ProductPage(){
    const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
    const [productList, setProductList] = useState<Product[]>([]);
    const [sidebarList, setSidebarList] = useState<string[]>([]);
    const [selectedProductType, setSelectedProductType] = useState<string>("");
    const { user } = useCartContext();

    useEffect(() => {
        const productTypeList = (Object.keys(ProductType) as Array<keyof typeof ProductType>).map((key) => {
            return key; //https://stackoverflow.com/questions/41308123/map-typescript-enum
        });
        setSidebarList(productTypeList);
        loadProducts(productTypeList[0]);
        setSelectedProductType(productTypeList[0]);
    }, []);

    const loadProducts = async (productType: string) => {
        const response = await productAPI.getProductsByType(productType.toUpperCase()); //KIV for a better solution to ensure always uppercase
        if (!response.error){
            const results = [];
            for (const item of response){
                results.push(new Product(item));
            }
            setProductList(results);
        } else {
            console.log(response.error);
            //No fruits found
        }
    }

    const reloadProduct = async (product: Product) => {
        const response = await productAPI.getProductById(product.id);
        if (!response.error){
            const updatedProduct = response[0];
            setProductList(productList.filter((product) => product.id !== updatedProduct.id).concat([updatedProduct]));
        } else {
            console.log(response.error);
            //Do nothing
        }
    }
    
    return (
    <div className="productpage">
        <div className="productpagecol1">
            <Typography variant="h5">{`Available ${stringHelper.capitaliseFirstChar(selectedProductType)}s`}</Typography>
            {user.account_type === "ADMIN" 
            ? 
            <Button onClick={() => setShowAddProductModal(true)}>Add Product!</Button>
            : <></>}
            <List className="sidebar">
                {sidebarList.map((item) => (
                    <ListItemButton key={item}
                        onClick={() => loadProducts(item)}>
                        <ListItemText className="sidebarlistitem" primary={item} />
                    </ListItemButton>
                ))}
            </List>
        </div>
        <div className="productpagecol2">
            {productList?.map((product) => (<ProductItem key={product.id} product={product} reloadProduct={reloadProduct}/>))}
            <AddProductModal showModal={showAddProductModal} setShowModal={setShowAddProductModal} reloadProduct={reloadProduct}/>
        </div>
    </div>
    );
}