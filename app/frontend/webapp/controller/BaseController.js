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

        onBaseInit: function() {
        
            this._pDialog = null;
            console.log("dialog",this._pDialog)
            this._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var that = this;
            // get the data from the local store
            var cartInfoValue = this._oStorage.get("baseModel");
            console.log("cartInforVlaue", cartInfoValue);
            if (cartInfoValue) {
                var cartInfo = JSON.parse(cartInfoValue);
                jQuery.ajax(
                    that.getBaseUrl() + "/cart/Carts(" + cartInfo.ID + ")",
                    {
                        contentType : 'application/json',
                        type : 'GET',
                        success: function() {
                            var baseModel = new JSONModel({
                                cartInfo: cartInfo
                            });
                            that.setModel(baseModel, "baseModel");
                        }
                    }
                ); 

                
            }
            else {
                var baseModel = new JSONModel({
                    cartInfo: {
                        ID: "",
                        cardNo: "Select cart",
                        total: ""
                    }
                });
                this.setModel(baseModel, "baseModel");
            }

            console.log("onInit work");
        },

        getBaseUrl: function() {
            var url1 = window.location.href
            url1 = url1.substring(0, url1.indexOf('/index.html'))
            var url2 = window.location.origin
            return url2;
        },

        onAfterRendering: function() {
            const data_expander_preferences = "JTdCJTIyZXhwYW5kZXJMb2dvJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZjZG4uY2FpLnRvb2xzLnNhcCUyRndlYmNoYXQlMkZ3ZWJjaGF0LWxvZ28uc3ZnJTIyJTJDJTIyZXhwYW5kZXJUaXRsZSUyMiUzQSUyMkNsaWNrJTIwb24lMjBtZSElMjIlMkMlMjJvbmJvYXJkaW5nTWVzc2FnZSUyMiUzQSUyMkNoYXQlMjB3aXRoJTIwbWUhJTIyJTJDJTIydGhlbWUlMjIlM0ElMjJERUZBVUxUJTIyJTdE"
            const data_channel_id = "5eed170f-fa43-4098-a9af-bddbcf29b0b5";
            const data_token = "96627c5f4b9c958bb778ceedf0b5b237";
            // load the bot
            console.log("load chat bot");
            var s = document.createElement("script");
            s.setAttribute("src", "https://cdn.cai.tools.sap/webclient/bootstrap.js");
            s.setAttribute("id", "cai-webclient-custom");
            s.setAttribute("data-channel-id",data_channel_id);
            s.setAttribute("data-token",data_token);
            s.setAttribute("data-expander-type","CAI");
            s.setAttribute("data-expander-preferences",data_expander_preferences);
            document.body.appendChild(s);
            // add client bridge
            const webclientBridge = {
                getMemory: () => {
                    let memory;
                    memory = {'mynumber': 200}
                    return {memory, merge: true}
                },
                onMessage: (payload) => {
                    payload.messages.map(message => {
                        if (message.attachment.type == 'client_data') {
                            var messageInfo = {};
                            messageInfo.hasNavigate = false;
                            messageInfo.hasParameter = false;
                            message.attachment.content.elements.map(pair => {
                                if (pair.key == 'navigate') {
                                    messageInfo.hasNavigate = true;
                                    messageInfo.page = pair.value;
                                    
                                }
                                else if (pair.key == 'parameter') {
                                    console.log("parameter", pair.value);
                                    messageInfo.hasParameter = true;
                                    messageInfo.parameter = pair.value;
                                }
                            })
                            console.log("Message info", messageInfo);
                            if (messageInfo.hasNavigate && !messageInfo.hasParameter) {
                                window.location.href = 'index.html#/' + messageInfo.page;
                            }
                            else if (messageInfo.hasNavigate && messageInfo.hasParameter) {
                                // for product page
                                if (messageInfo.page === "") {
                                    window.location.href = 'index.html#/' + messageInfo.page + '?category=' + messageInfo.parameter;
                                }
                                // for cart page
                                else if (messageInfo.page == "carts") {
                                    window.location.href = 'index.html#/' + messageInfo.page
                                }
                                // for cart detail page
                                else if (messageInfo.page == "cartdetail") {
                                    window.location.href = 'index.html#/' + messageInfo.page + '/' + messageInfo.parameter;
                                }
                            }
                        }
                    });
                }
            
            }
            
            window.sapcai = {
                webclientBridge,
            }
        },


        onCartClicked: function(oEvent) {
            var oButton = oEvent.getSource(),
				oView = this.getView();
            if (!this._pDialog) {
                var that = this;
				this._pDialog = Fragment.load({
					id: "cartSelectionDialog",
                    name: "frontend.view.CartSelectionDialog",
					controller: this
				}).then(function (oDialog){
                    // open dialog
					oDialog.setModel(oView.getModel());
                    that._table = oDialog.getContent()[0]
					return oDialog;
				});
			}

			this._pDialog.then(function(oDialog){
                var that = this;
                oDialog.attachAfterOpen(function() {
                    var baseModel = that.getModel("baseModel");
                    var cartInfo = baseModel.oData.cartInfo;
                    // set selected item back to table
                    if (cartInfo.ID != "") {
                        var items = that._table.getItems()
                        console.log("items", items);
                        for (var i = 0; i < items.length; i++) {
                            var obj = items[i].getBindingContext().getObject();
                            if (obj.ID == cartInfo.ID) {
                                // set selected row for table
                                console.log("set selected row here");
                                console.log("selectedItem", items[i]);
                                that._table.setSelectedItem(items[i]);
                            }
                        }
                    }
                    
                });
                
				oDialog.open();
                
                console.log("table",this._table)
                
			}.bind(this));
        },

        onEditClicked: function (oEvent) {
            console.log("go to cart");
            var cartInfoValue = this._oStorage.get("baseModel");
            var cartInfo = JSON.parse(cartInfoValue);
            if (cartInfo.ID !== "") {
                // go to cart detail
                console.log("cartId", cartInfo.ID);
                this.getRouter().navTo("RouteCartDetailView", {
                    cartId: cartInfo.ID
                });
                
            }
            else {
                alert("Please select a cart");
            }

            
        },

        onManageClicked: function (oEvent) {
            this.getRouter().navTo("RouteCartView");
        },

        onCartItemClicked: function (oEvent) {

            var source = oEvent.getSource();
            console.log("source",source);
            var item =  oEvent.getSource().getSelectedItem();
            var object = item.getBindingContext().getObject();
            console.log("item", item);
            console.log("object", object);
            var cartInfo = {
                ID: object.ID,
                cardNo: object.CardNo,
                total: object.total
            }
            // set to base model
            var baseModel = new JSONModel({
                cartInfo: cartInfo
            });
            this.setModel(baseModel, "baseModel");
            // save to cookie
            this._oStorage.put("baseModel", JSON.stringify(cartInfo));
            
        },


        onDialogCancelClicked: function(oEvent) {
            this._pDialog.then(function(oDialog) {
                oDialog.close();
            })
        },

        onDialogOkClicked: function(oEvent) {
            this._pDialog.then(function(oDialog) {
                oDialog.close();
            })
        },

        onPressOpenBot: function (oEvent) {
            console.log("window", window.sap.webchat);
            window.sap.cai.webclient.show();
        },

        onPressCloseBot: function (oEvent) {
            window.sap.cai.webclient.hide();
        },

        onPressToggleBot: function (oEvent) {
            window.sap.cai.webclient.toggle();
        }
    });

});