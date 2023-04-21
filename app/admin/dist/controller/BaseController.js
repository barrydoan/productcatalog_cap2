sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/m/library","sap/ui/core/Fragment","sap/ui/model/json/JSONModel"],function(e,t,n,o,r,i,u){"use strict";return e.extend("frontend.controller.BaseController",{getRouter:function(){return t.getRouterFor(this)},getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},getBaseUrl:function(){var e=window.location.href;e=e.substring(0,e.indexOf("/index.html"));var t=window.location.origin;return t},onMenuPress:function(){var e=this.getView(),t=e.byId("buttonMenu");if(!this._oMenuFragment){this._oMenuFragment=o.load({id:e.getId(),name:"admin.view.Menu",controller:this}).then(function(e){e.openBy(t);this._oMenuFragment=e;return this._oMenuFragment}.bind(this))}else{this._oMenuFragment.openBy(t)}},onMenuAction:function(e){var t=e.getParameter("item");var n=t.getText();if(n==="Products"){this.getRouter().navTo("RouteProductList")}else if(n==="Carts"){this.getRouter().navTo("RouteCartList")}else if(n==="Categories"){}else if(n==="Suppliers"){}}})});