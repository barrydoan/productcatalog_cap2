using { com.sap.productcatalog as my } from '../db/schema';

@path:'/browse'
service CatalogService {

    @readonly entity Products as SELECT from my.Products {
        *,
        category.name as category,
        supplier.name as supplier
    } excluding { createdBy, modifiedBy };

    entity Orders as projection on my.Orders;
}