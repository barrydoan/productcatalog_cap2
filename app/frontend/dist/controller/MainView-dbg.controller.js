sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "frontend/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    'sap/ui/model/Sorter',
    'sap/ui/model/odata/v4/ODataModel',
    'sap/base/util/UriParameters',
    'sap/ui/core/routing/HashChanger'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, Device, Sorter, ODataModel, UriParameters, HashChanger) {
    "use strict";

    return BaseController.extend("frontend.controller.MainView", {

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
            this._mViewSettingsDialogs = {};
            var oViewModel,
                iOriginalBusyDelay,
                oTable = this.byId("table");

            // Put down worklist table's original value for busy indicator delay,
            // so it can be restored later on. Busy handling on the table is
            // taken care of by the table itself.
            iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
                tableBusyDelay: 0
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });

            var origin = window.location.origin;
            console.log("origin", origin);
            this._oDataModel = new ODataModel({
                groupId : "$direct",
                synchronizationMode : "None",
                serviceUrl : "cart/"
            })
            console.log("oDataModel", this._oDataModel);
            //
            var oHashChanger = HashChanger.getInstance();
            var that = this;
            oHashChanger.attachEvent("hashChanged", function(oEvent) {
                // change the filter based on the url
                console.log("Hash changed");
                var category = UriParameters.fromQuery(window.location.hash.replace('#/', '')).get("category");
                if (category) {
                    var oBinding = that.byId("table").getBinding("items");
                    var oFilter = new Filter("categoryName", "EQ", category);
                    oBinding.filter([oFilter]);
                    // set value for category
                    that.byId("oComboBoxCategory").setValue(category);
                    window.location.hash = '';
                }
            });

            
            
        },

    

        

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
            console.log("onUpdateFinished");
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
            
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
            // The source is the list item that got pressed
            console.log("Item clicked");
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function () {
            history.go(-1);
        },



        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any master list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("name", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getProperty("ProductID")
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },


        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("frontend.view.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("table"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },

        onCategoryChange: function (oEvent) {
            var comboBoxValue = this.byId("oComboBoxCategory").getValue(),
                oBinding = this.byId("table").getBinding("items"),
                oFilter;
            if (comboBoxValue) {
                oFilter = new Filter("categoryName", "EQ", comboBoxValue);
                oBinding.filter([oFilter]);
            } else if (comboBoxValue === "") {
                oBinding.filter([]);
            }
        },

        onSupplierChange: function (oEvent) {
            var comboBoxValue = this.byId("oComboBoxSupplier").getValue(),
                oBinding = this.byId("table").getBinding("items"),
                oFilter;
            if (comboBoxValue) {
                oFilter = new Filter("supplierName", "EQ", comboBoxValue);
                oBinding.filter([oFilter]);
            } else if (comboBoxValue === "") {
                oBinding.filter([]);
            }
        },

        onAddToCart: function (eEvent) {
            console.log(eEvent);
            var button = eEvent.getSource();
            console.log(button.oParent)
            var productId = jQuery.sap.byId(button.oParent.sId).find("[name='productId']").val();
            var productQuantity = jQuery.sap.byId(button.oParent.sId).find("[name='productQuantity']").val();
            console.log(productId);
            console.log(productQuantity);
            
            console.log(jQuery.sap)


            var baseModel = this.getModel("baseModel");
            var cartInfo = baseModel.oData.cartInfo;
            var data = 
            {
                "parent_ID": cartInfo.ID,
                "product_ID": parseInt(productId)
            }
            console.log("data", data);
            
            if (cartInfo.ID == "") {
                alert("Please select cart");
            }
            else {
                jQuery.ajax(
                    this.getBaseUrl() + "/cart/CartItems",
                    {
                        data:  JSON.stringify(data),
                        contentType : 'application/json',
                        type : 'POST'
                    }
                ); 
            }

           

            
        },
        showProductDetail: function(oEvent) {
            var source = oEvent.getSource();
            var context = source.getBindingContext();
            var productId = context.getProperty("ID");
            console.log("id", productId);
            // navigate to cart detail page
            this.getRouter().navTo("RouteProductDetailView", {
                productId: productId
            });
            
        },
        

    });

});