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
                this.productId = ""
                this.file = null
                this._formFragments = {};

                var route = this.getRouter().getRoute("RouteProductDetail");
                route.attachPatternMatched(this._attachPatternMatched, this);
                this._showFormFragment("ProductDetailDisplay")


            },

            _attachPatternMatched: function (oEvent) {
                console.log("oEvent", oEvent);
                this.productId = oEvent.getParameters().arguments.productId;
                console.log("productId", this.productId);
                this.getView().bindElement(`/Products/${this.productId}`);


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
                });
            },
            _toggleButtonsAndView: function (bEdit) {
                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                this._showFormFragment(bEdit ? "ProductDetailChange" : "ProductDetailDisplay");
            },

            handleEditPress: function () {
                this._toggleButtonsAndView(true);
            },

            handleCancelPress: function () {
                this._toggleButtonsAndView(false);

            },
            handleSavePress: function() {
                var that = this
                this.getView().getModel().submitBatch("updateProduct").then(function() {
                    that._toggleButtonsAndView(false);
                })
            },

            onFileChange: function (oEvent) {
                console.log("onFileChange")
                this.file = oEvent.getParameters("files").files[0];
            },

            onUploadFile: function () {
                if (this.file === null) {
                    alert("Please select a file")
                }
                var that = this;

                //This code is used for uploading image or document file

                console.log("file", this.file)


                var reader = new FileReader();
                reader.onload = function (e) {
                    console.log("e", e)
                    var base64_marker = ';base64,'
                    var vContent = e.currentTarget.result
                    var base64Index = e.target.result.indexOf(base64_marker) + base64_marker.length; // locate base64 content
                    var base64 = e.target.result.substring(base64Index); // get base64 content
                    console.log('base64', base64);
                    console.log('vContent', vContent);
                    that.updateProductImage(base64);
                }
                reader.readAsDataURL(this.file);
            },
            
            updateProductImage: function(vContent) {
                var blob = this.b64toBlob(vContent, 'image/jpeg')
                var that = this
                jQuery.ajax(
                    this.getBaseUrl() + `/admin/Products(${this.productId})/data`,
                    {
                        data:  blob,
                        contentType : false,
                        processData: false,
                        type : 'PUT',
                        success: function() {
                            var oImg = that.getView().byId('productImage')
                            oImg.setSrc(that.getBaseUrl() + `/admin/Products(${that.productId})/data`,)
                            console.log('oImg', oImg)
                        }
                    },
                    
                ); 
            },

            b64toBlob: function(b64Data, contentType='', sliceSize=512) {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];
              
                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                  const slice = byteCharacters.slice(offset, offset + sliceSize);
              
                  const byteNumbers = new Array(slice.length);
                  for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                  }
              
                  const byteArray = new Uint8Array(byteNumbers);
                  byteArrays.push(byteArray);
                }
              
                const blob = new Blob(byteArrays, {type: contentType});
                return blob;
              }
        });
    });
