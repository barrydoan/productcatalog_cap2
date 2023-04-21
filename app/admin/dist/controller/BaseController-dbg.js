sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    'sap/ui/core/Fragment',
    "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, mobileLibrary, Fragment, JSONModel, webclient, webclientbridge) {
    "use strict";

    return Controller.extend("frontend.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },


        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        getBaseUrl: function () {
            var url1 = window.location.href
            url1 = url1.substring(0, url1.indexOf('/index.html'))
            var url2 = window.location.origin
            return url2;
        },
        onMenuPress: function () {
            var oView = this.getView(),
                oButton = oView.byId("buttonMenu");

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "admin.view.Menu",
                    controller: this
                }).then(function (oMenu) {
                    oMenu.openBy(oButton);
                    this._oMenuFragment = oMenu;
                    return this._oMenuFragment;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oButton);
            }
        },
        onMenuAction: function(oEvent) {
            var oItem = oEvent.getParameter("item")

            var text = oItem.getText()
            if (text === 'Products') {
                // goto product list
                this.getRouter().navTo("RouteProductList");
            }
            else if (text === 'Carts') {
                // goto cart list
                this.getRouter().navTo("RouteCartList");
            }
            else if (text === 'Categories') {
                // goto category list
            }
            else if (text === 'Suppliers') {
                // goto supplier list
            }
        }
    
    });

});