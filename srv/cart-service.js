const cds = require('@sap/cds')
const { Carts, CartItems, Products } = cds.entities


/** Service implementation for CatalogService */
module.exports = cds.service.impl(srv => {
   srv.before('CREATE', 'CartItems', _fillItemInfoAndDeleteSameItem)
   srv.before('UPDATE', 'CartItems', _fillItemInfo)
   srv.after(['CREATE', 'UPDATE'], 'CartItems', _updateCartTotal)
   srv.before('DELETE', 'CartItems', _afterFunction)
})

/**
 * Fill all information for cart item
 * 
 * @param {*} req 
 */
async function _fillItemInfo(req) {
    console.log(req.data)
    const {parent_ID, product_ID} = req.data
    const tx = cds.transaction(req);
    // get cart by id
    let cart = await cds.run(SELECT.from(Carts).byKey(parent_ID))
    console.log(cart)
    // get product by id
    let product = await cds.run(
        SELECT.from(Products)        
        .byKey(product_ID)
    )
    console.log(product)
    // update amount and netAmount
    if (!req.data.amount) {
        req.data['amount'] = 1
    }
    if (!req.data.netAmount) {
        req.data['netAmount'] = product.acqCost
    }

    
    
}

async function _deleteSameCartItem(req) {
    const {parent_ID, product_ID} = req.data
    // select the item in the cart
    let items = await cds.run(
        SELECT.from(CartItems)
        .where({parent_ID: parent_ID, and: {product_ID: product_ID}})
    )
    var amount = 0
    items.map(item => {
        amount += item.amount
    })
    // update amount
    req.data.amount += amount
    // delete item belong to cart
    cds.run(
        DELETE.from(CartItems)
        .where({parent_ID: parent_ID, and: {product_ID: product_ID}})
    )
}

async function _fillItemInfoAndDeleteSameItem(req) {
    await _fillItemInfo(req)
    await _deleteSameCartItem(req)
}


/**
 * Update cart total when adding or removing an item out of an order
 * 
 * @param {*} req 
 */
async function _updateCartTotal(data) {
    console.log('This is the after service')       
    let cart = await cds.run(
        SELECT.from(Carts).byKey(data.parent_ID)
    )
    // select all item of card
    let cartItems = await cds.run(
        SELECT.from(CartItems).where({parent_ID: cart.ID})
    )
    // update total
    var total = 0
    cartItems.map(item => {
        total += item.amount * parseFloat(item.netAmount)
    })
    // update cart
    await cds.run(
        UPDATE(Carts, cart.ID)
        .with({total})
    )

}

async function _afterFunction(req) {
    console.log('This is after delete function')
    console.log(req.params)
    // select item
    let cartItem = await cds.run(
        SELECT.from(CartItems)
        .byKey(req.params[0])
    )
    // get all cartItem of cart
    let cartItems = await cds.run(
        SELECT.from(CartItems)
        .where({parent_ID: cartItem.parent_ID})
    )
    // caculate the total
    var total = 0.0
    cartItems.map(item => {
        if (item.ID !== cartItem.ID)
        {
            total += item.amount * parseFloat(item.netAmount)
        }
    })
    // update cart total
    await cds.run(
        UPDATE(Carts, cartItem.parent_ID)
        .with({total})        
    )
}