sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "frontend/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    'sap/ui/model/Sorter',
    'sap/ui/model/odata/v4/ODataModel'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, Device, Sorter, ODataModel) {
    "use strict";

    return BaseController.extend("frontend.controller.controller.CartView", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            this.onBaseInit();
            var table = this.byId("table");
            console.log("table", table)
        },

        showCartDetail: function(oEvent) {
            var source = oEvent.getSource();
            var context = source.getBindingContext();
            var cartId = context.getProperty("ID");
            console.log("id", cartId);
            // navigate to cart detail page
            this.getRouter().navTo("RouteCartDetailView", {
                cartId: cartId
            });
            
        },
        onCreateClicked: function(oEvent) {
            var view = this.getView();
            var date = new Date();
            var formatedDate = date.getFullYear() + "-" + (date.getMonth() < 8 ? "0" + date.getMonth(): date.getMonth()) + "-" + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()));
            var newCartModel = new JSONModel({
                cartNo:formatedDate,
                total: 0.00
            })
            if (!this.createCartDialog) {
                this.createCartDialog = Fragment.load({
					id: "createCartDialog",
                    name: "frontend.view.CreateCartDialog",
					controller: this
				})
            }
            this.createCartDialog.then(function(oDialog) {
                console.log("dialog", oDialog);
                oDialog.setModel(newCartModel)
                var model = oDialog.getModel();
                console.log("model", model)
				oDialog.open();
			});

        },
        onDialogNewCartCancelClicked: function(oEvent) {
            this.createCartDialog.then(function(oDialog) {
                oDialog.close();
            })
        },
        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },
        onDialogNewCartOkClicked: function(oEvent) {
            var that = this;
            this.createCartDialog.then(function(oDialog) {
                console.log("oData", oDialog.getModel().oData);
                var data = {
                    "CardNo": oDialog.getModel().oData.cartNo,
                    "total": oDialog.getModel().oData.total
                }
                // create new cart
                jQuery.ajax(
                    that.getBaseUrl() + "/cart/Carts",
                    {
                        data:  JSON.stringify(data),
                        contentType : 'application/json',
                        type : 'POST',
                        success: function(data) {
                            that.onRefresh();
                            oDialog.close();
                        }
                    }
                ); 
            });
        }, 
        onDeleteClicked: function(oEvent) {
            var button = oEvent.getSource();
            console.log(button.oParent)
            var cartId = jQuery.sap.byId(button.oParent.sId).find("[name='cartId']").val();
            console.log("cartId", cartId);
            var that = this;
            jQuery.ajax(
                that.getBaseUrl() + "/cart/Carts(" + cartId + ")",
                {
                    contentType : 'application/json',
                    type : 'DELETE',
                    success: function () {
                        that.onRefresh();
                    }
                },
            ); 
        },
        onAcceptClicked: function(oEvent) {
            var button = oEvent.getSource();
            var cartId = jQuery.sap.byId(button.oParent.oParent.sId).find("[name='cartId']").val();
            console.log("cartId", cartId);
            var cartNo = jQuery.sap.byId(button.oParent.sId).find("[name='cartNo']").val();
            console.log("cartNo", cartNo);
            // update cart
            var data = {
                "ID": cartId,
                "cardNo": cartNo
            }
            var that = this;
            jQuery.ajax(
                that.getBaseUrl() + "/cart/Carts(" + cartId + ")",
                {
                    contentType : 'application/json',
                    data: JSON.stringify(data),
                    type : 'PUT',
                    success: function () {
                        that.onRefresh();
                    }
                },
            ); 
        }
    });

});