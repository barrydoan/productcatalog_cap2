using { com.sap.productcatalog as my } from '../db/schema';

service AdminService  {
  entity Products as projection on my.Products;
  entity Suppliers as projection on my.Suppliers;
  entity Categories as select from my.Categories;
  entity Orders as select from my.Orders;
  entity Carts as select from my.Carts;
  entity CartItems as select from my.CartItems;
}