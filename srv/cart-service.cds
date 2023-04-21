using { com.sap.productcatalog as my } from '../db/schema';

@path:'/cart'
service CartService {

    @readonly entity Categories as projection on my.Categories;
    @readonly entity Suppliers as projection on my.Suppliers;
    entity Carts as projection on my.Carts;
    @readonly entity Products as SELECT from my.Products {
        *,
        category.name as categoryName,
        supplier.name as supplierName
    } excluding { createdBy, modifiedBy };

   

    entity CartItems as SELECT from my.CartItems {
        *
    };
}