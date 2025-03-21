import { useState } from "react";
//mui imports
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, LinearProgress, TextField } from "@mui/material";
//api imports
import * as productAPI from "../../api/product-api";
//model imports
import { Product, ProductType } from "../../models/Product";
//context imports
import { useModalContext } from "../../context/ModalContext";

type AddProductModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    reloadProduct: (product: Product) => void;
};

export default function AddProductModal({ showModal, setShowModal, reloadProduct }: AddProductModalProps){
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [productType, setProductType] = useState<string>("");
    const { toggleMessageModal } = useModalContext();

    const handleProductType = (event: SelectChangeEvent) => {
        setProductType(event.target.value);
    }

    const handleClose = () => {
        setShowModal(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const addProductAction = async () => {
                setShowLoading(true);
                //Get form inputs
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());
                //Check product type selection
                const pTypeValues = Object.values(ProductType) as string[];
                if (!pTypeValues.includes(productType)){
                    throw (`Product Type is not selected.`);
                }
                //Check quantity input
                try {
                    const quantity = parseInt(formJson.quantity);
                    if (!quantity){
                        throw (`Please enter only numbers for Quantity.`);
                    }
                    //Dont allow -ve numbers, and set a temp limit of 10000
                    if (quantity < 0 || quantity > 10000){
                        throw (`Quantity must be less than 10000 and cannot be negative!`);
                    }
                } catch (error) {
                    //assume parsing error only
                    throw (`Please enter only whole numbers for Quantity.`);
                }
                //Check unit price input
                try {
                    //https://stackoverflow.com/questions/68784025/how-to-prevent-the-input-field-from-accepting-more-than-2-decimal-places-in-reac
                    //https://stackoverflow.com/questions/66763023/react-material-ui-textfield-decimal-step-of-1-00-on-1-00-as-a-default-number
                    const unit_price = parseFloat(formJson.unit_price); 
                    if (!unit_price){
                        throw (`Please enter only numbers for Unit Price.`);
                    }
                    //Dont allow -ve numbers, and set a temp limit of 1000
                    if (unit_price < 0 || unit_price > 1000){
                        throw (`Unit Price must be less than 1000 and cannot be negative!`);
                    }
                } catch (error) {
                    //assume parsing error only
                    throw (`Please enter only numbers for Unit Price.`);
                }
                //After all checks, build new product object for api call
                let newProduct = new Product({
                    product_type : productType,
                    name: formJson.name.toUpperCase(),
                    image: formJson.image,
                    quantity: formJson.quantity,
                    unit_price: Number(parseFloat(formJson.unit_price).toFixed(2))
                });
                const response = await productAPI.addProduct(newProduct);
                if (!response.error){
                    handleClose();
                    reloadProduct(new Product({id: response[0].id}));
                } else {
                    throw (`Error adding product: ${response.error}`);
                }
            }
            await addProductAction();
        } catch (error) {
            toggleMessageModal(true, `${error}`, "ERROR");
        }
        setShowLoading(false);
    };

    return (
        <Dialog
            open={showModal}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit
                },
            }}>
            <DialogTitle>Add a new Product</DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="ptype-label">{`Product Type`}</InputLabel>
                    <Select
                        labelId="ptype-label"
                        value={productType}
                        label="Age"
                        onChange={handleProductType}
                    >
                    {(Object.keys(ProductType) as Array<keyof typeof ProductType>).map((productType) => 
                        (<MenuItem key={productType} value={productType}>{`${productType}`}</MenuItem>)
                    )}
                    </Select>
                </FormControl>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="image"
                    label="Image URL"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="quantity"
                    label="Quantity"
                    type="number"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="unit_price"
                    label="Unit Price"
                    type="text" 
                    fullWidth
                    variant="standard"/>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Add</Button>
            </DialogActions>
            <Box sx={{ width: '100%', display: showLoading ? "" : "none"}}>
                <LinearProgress/>
            </Box>
        </Dialog>
    );
}