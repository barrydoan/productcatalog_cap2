const cds = require('@sap/cds')
const { Products } = cds.entities
const { Orders } = cds.entities

/** Service implementation for CatalogService */
module.exports = cds.service.impl(srv => {
    // reduce stock of the order
    srv.before ('CREATE', 'Orders', _updateStatus)
    // add item to card
    
})



/** Reduce stock of ordered products if available stock suffices */
async function _updateStatus (req) {
    const { Items: orderItems, ID: orderID} = req.data
    const tx = cds.transaction(req);
    var total = 0.0
    orderItems.map(item => {
        total += parseFloat(item.netAmount)
    })
    req.data['total'] = total
    return Promise.all(orderItems.map(item => {
        console.log(item)
        tx.run(
            UPDATE(Products)
            .where({ID: item.product_ID})
            .and('stock >=', item.amount)
            .set('stock -=', item.amount)

        ).then(affectedRow => {
            if (affectedRow == 0) {
                req.error(409, `${item.amount} exceeds stock for product #${item.product_ID}`)
            }
        })
    }))
}

async function createCartHandler(req) {
    console.log(req)
}
