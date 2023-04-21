namespace com.sap.productcatalog;

using { Currency, managed, cuid } from '@sap/cds/common';


entity Products : managed {
    key ID : Integer;
    shortId: String(8);
    NDC: String(20);
    UPC: String(20);
    name  : String(111);
    stock  : Integer;
    acqCost: Decimal(9,2);
    retailPrice  : Decimal(9,2);
    awp: Decimal(9,2);
    rebate: Decimal(9,2);
    perDose: Decimal(9,2);
    unitSize: Decimal(9,2);
    form: String(10);
    caseQuantity: Integer;
    imageUrl  : String;
    data: LargeBinary @Core.MediaType: 'application/binary';
    currency : Currency;
    supplier: Association to Suppliers;
    category: Association to Categories;
}


entity Suppliers : managed {
    key ID : Integer;
    name   : String(111);
    status: String(10);
    products  : Association to many Products on products.supplier = $self;
}

entity Categories: managed, cuid {
    key ID : Integer;
    name   : String(111);
    products : Association to many Products on products.category = $self;
}

entity Orders : cuid, managed {
    OrderNo  : String @title:'Order Number'; //> readable key
    Items    : Composition of many OrderItems on Items.parent = $self;
    total    : Decimal(9,2) @readonly;
    currency : Currency;
}

entity OrderItems : cuid {
    parent    : Association to Orders;
    product      : Association to Products;
    amount    : Integer;
    netAmount : Decimal(9,2);
}

entity Carts : cuid, managed {
    CardNo  : String @title:'Cart Number'; //> readable key
    Items    : Composition of many CartItems on Items.parent = $self;
    total    : Decimal(9,2) @readonly;
    currency : Currency;
}


entity CartItems : cuid {
    parent    : Association to Carts;
    product      : Association to Products;
    amount    : Integer;
    netAmount : Decimal(9,2);
}


