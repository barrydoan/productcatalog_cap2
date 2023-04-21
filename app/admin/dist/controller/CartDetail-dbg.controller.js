sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
    "./BaseController",
    "sap/ui/core/Fragment",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, RowAction, RowActionItem, RowSettings, BaseController, Fragment) {
        "use strict";
        return BaseController.extend("admin.controller.ProductDetail", {
            onInit: function () {
                this.cartId = ""
                this._formFragments = {};

                var route = this.getRouter().getRoute("RouteCartDetail");
                route.attachPatternMatched(this._attachPatternMatched, this);
                this._showFormFragment("CartDetailDisplay")

                var fnPress = this.handleActionPress.bind(this);
                this.modes = [
                    {
                        key: "Delete",
                        text: "Delete",
                        handler: function() {
                            var oTemplate = new RowAction({items: [
                                new RowActionItem({type: "Delete", press: fnPress})
                            ]});
                            return [1, oTemplate];
                        }
                    }, {
                        key: "None",
                        text: "No Actions",
                        handler: function() {
                            return [0, null];
                        }
                    }
                ];

                this.getView().setModel(new JSONModel({ items: this.modes }), "modes");
                

            },

            onNavIndicatorsToggle: function (oEvent) {
                var oTable = this.byId("tableedit");
                var oToggleButton = oEvent.getSource();

                if (oToggleButton.getPressed()) {
                    oTable.setRowSettingsTemplate(new RowSettings({
                        navigated: "{NavigatedState}"
                    }));
                } else {
                    oTable.setRowSettingsTemplate(null);
                }
            },

            onBehaviourModeChange: function (oEvent) {
                this.switchState(oEvent.getParameter("selectedItem").getKey());
            },

            switchState: function (sKey) {
                var oTable = this.byId("tableedit");
                var iCount = 0;
                var oTemplate = oTable.getRowActionTemplate();
                if (oTemplate) {
                    oTemplate.destroy();
                    oTemplate = null;
                }

                for (var i = 0; i < this.modes.length; i++) {
                    if (sKey == this.modes[i].key) {
                        var aRes = this.modes[i].handler();
                        iCount = aRes[0];
                        oTemplate = aRes[1];
                        break;
                    }
                }

                oTable.setRowActionTemplate(oTemplate);
                oTable.setRowActionCount(iCount);
            },

            _attachPatternMatched: function (oEvent) {
                console.log("oEvent", oEvent);
                this.cartId = oEvent.getParameters().arguments.cartId;
                console.log("cartId", this.cartId);
                this.getView().bindElement(`/Carts(${this.cartId})`);
            },

            _getFormFragment: function (sFragmentName) {
                var pFormFragment = this._formFragments[sFragmentName],
                    oView = this.getView();

                if (!pFormFragment) {
                    pFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "admin.view." + sFragmentName,
                        controller: this
                    });
                    this._formFragments[sFragmentName] = pFormFragment;
                }

                return pFormFragment;
            },

            _showFormFragment: function (sFragmentName) {
                var oPage = this.byId("page");
                var that = this
                oPage.removeAllContent();
                this._getFormFragment(sFragmentName).then(function (oVBox) {
                    oPage.insertContent(oVBox);
                    var oModel = that.getView().getModel();
                    // refresh data
                    oModel.refresh()
                    if (sFragmentName === "CartDetailChange") {
                        that.switchState("Delete");
                    }
                });
            },
            _toggleButtonsAndView: function (bEdit) {
                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                this._showFormFragment(bEdit ? "CartDetailChange" : "CartDetailDisplay");
            },

            handleEditPress: function () {
                this._toggleButtonsAndView(true);
            },

            handleCancelPress: function () {
                this._toggleButtonsAndView(false);

            },
            handleSavePress: function() {
                var that = this
                
                var oItems = this.getView().byId("tableedit").getRows();
                var oModel = this.getView().byId("tableedit").getModel();
                console.log('oItem', oItems)
                console.log('oModel', oModel)
                /*
                oItems.forEach(function(oItem) {
                    var oContext = oItem.getBindingContext()
                    console.log("path", oContext.getPath())
                });
                */
            
                
                this.getView().getModel().submitBatch("updateCart").then(function() {
                    that._toggleButtonsAndView(false);
                })
                
            },
            handleActionPress: function (oEvent) {
                var oRow = oEvent.getParameter("row");
                var oItem = oEvent.getParameter("item");
                var source = oEvent.getSource();
                var context = source.getBindingContext();
                var id = context.getProperty("ID");
                var that = this;
                if (oItem.getType() === "Delete") {
                    console.log("Delete row")
                    var listBinding = this.getView().getModel().bindList(`/Carts(${this.cartId})/Items`)
                    listBinding.requestContexts().then(function (aContexts) {
                        aContexts.forEach(function (oContext) {
                            if (oContext.getProperty("ID") === id) {
                                oContext.delete().then(function () {
                                    var oModel = that.getView().getModel();
                                    // refresh data
                                    oModel.refresh()
                                });
                            }
                        });
                    });
                }

                
            }

            
            
            
        });
    });
