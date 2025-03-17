import { useEffect, useState } from "react";
//mui imports
import { Box, Button, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
//api imports
import * as productAPI from "../../api/product-api";
//model imports
import { Product, ProductType } from "../../models/Product";
//custom component imports
import ProductItem from "../../components/Product/ProductItem";
import AddProductModal from "../../components/Product/AddProductModal";
//context imports
import { useMainContext } from "../../context/MainContext";
//util imports
import * as stringHelper from "../../util/stringHelper";
import "./ProductPage.css";


export default function ProductPage(){
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
    const [productList, setProductList] = useState<Product[]>([]);
    const [sidebarList, setSidebarList] = useState<string[]>([]);
    const [selectedProductType, setSelectedProductType] = useState<string>("");
    const { user } = useMainContext();

    useEffect(() => {
        const productTypeList = (Object.keys(ProductType) as Array<keyof typeof ProductType>).map((key) => {
            return key; //https://stackoverflow.com/questions/41308123/map-typescript-enum
        });
        setSidebarList(productTypeList);
        loadProducts(productTypeList[0]);
        setSelectedProductType(productTypeList[0]);
    }, []);

    const loadProducts = async (productType: string) => {
        setShowLoading(true);
        const response = await productAPI.getProductsByType(productType.toUpperCase()); //KIV for a better solution to ensure always uppercase
        if (!response.error){
            const results = [];
            for (const item of response){
                results.push(new Product(item));
            }
            setProductList(results.sort((a, b) => a.id - b.id));
            setSelectedProductType(productType);
        } else {
            console.log(response.error);
            //No fruits found
        }
        setShowLoading(false);
    }

    const reloadProduct = async (product: Product) => {
        const response = await productAPI.getProductById(product.id);
        if (!response.error){
            const updatedProduct = response[0];
            //Check if product type is currently selected
            if (selectedProductType === updatedProduct.product_type.toString().toUpperCase()){
                const updatedProductList = productList.filter((product) => product.id !== updatedProduct.id).concat([updatedProduct]);
                setProductList(updatedProductList.sort((a, b) => a.id - b.id));
            }
        } else {
            console.log(response.error);
            //Do nothing
        }
    }
    
    return (
    <div className="productpage">
        <div className="productpagecol1">
            {user.account_type === "ADMIN" 
            ? 
            <Button variant="outlined" onClick={() => setShowAddProductModal(true)}>Add Product!</Button>
            : <></>}
            <Typography variant="h5">{`Available ${stringHelper.capitaliseFirstChar(selectedProductType)}s`}</Typography>
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
            {showLoading 
            ? 
            <Box sx={{ display: showLoading ? "" : "none" }}>
                <CircularProgress />
            </Box>
            : 
            <>
            {productList?.length > 0 
                ?
                <>{productList?.map((product) => (<ProductItem key={product.id} product={product} reloadProduct={reloadProduct}/>))}</> 
                : 
                <></>}
            </>}
            <AddProductModal showModal={showAddProductModal} setShowModal={setShowAddProductModal} reloadProduct={reloadProduct}/>
        </div>
    </div>
    );
}