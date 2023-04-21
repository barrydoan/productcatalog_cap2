const cds = require('@sap/cds')
const { Carts, CartItems, Products } = cds.entities


/** Service implementation for CatalogService */
module.exports = cds.service.impl(srv => {
   srv.after(['CREATE', 'UPDATE'], 'CartItems', _updateCartTotal)
   srv.before('DELETE', 'CartItems', _afterFunction)
})


/**
 * Update cart total when adding or removing an item out of an order
 * 
 * @param {*} req 
 */
async function _updateCartTotal(data) {
    console.log('This is the after service')       
    console.log(data)
    let cartitem = await cds.run(
        SELECT.from(CartItems).byKey(data.ID)
    )
    let cart = await cds.run(
        SELECT.from(Carts).byKey(cartitem.parent_ID)
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
    console.log('total', total)
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