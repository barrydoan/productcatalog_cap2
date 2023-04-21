sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","frontend/model/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/ui/Device","sap/ui/table/RowAction","sap/ui/table/RowActionItem","sap/ui/model/Sorter","sap/ui/model/odata/v4/ODataModel"],function(t,e,a,r,o,n,s,i,c,l,d){"use strict";return t.extend("frontend.controller.CartDetailView",{formatter:a,onInit:function(){this.onBaseInit();var t=new e({busy:true,delay:0});this.setModel(t,"objectView");var a=this.getView();console.log("View",a);var r=this.byId("table");this.cartId="";var o=this.getRouter().getRoute("RouteCartDetailView");console.log("route",o);o.attachPatternMatched(this._attachPatternMatched,this)},_attachPatternMatched:function(t){console.log("oEvent",t);this.cartId=t.getParameters().arguments.cartId;console.log("cartId",this.cartId);var e=this.getView();console.log("view",e);var a=this;this.getCartDetail(this.cartId);this.getCartItem(this.cartId)},onDeleteClicked:function(t){var e=t.getSource();console.log(e.oParent);var a=jQuery.sap.byId(e.oParent.sId).find("[name='cartItemId']").val();console.log("cartItemId",a);var r=this;jQuery.ajax(r.getBaseUrl()+"/cart/CartItems("+a+")",{contentType:"application/json",type:"DELETE",success:function(){r.getCartItem(r.cartId);r.getCartDetail(r.cartId)}})},onEditClicked:function(t){var e=t.getSource();console.log(e.oParent);var a=jQuery.sap.byId(e.oParent.oParent.sId).find("[name='cartItemId']").val();console.log("cartItemId",a);var r=jQuery.sap.byId(e.oParent.sId).find("[name='parentId']").val();console.log("parentId",r);var o=jQuery.sap.byId(e.oParent.sId).find("[name='productId']").val();console.log("productId",o);var n=jQuery.sap.byId(e.oParent.oParent.sId).find("[name='quantity']").val();console.log("quantity",n);var s=this;if(n>0){var i={parent_ID:r,product_ID:parseInt(o),amount:parseInt(n)};jQuery.ajax(s.getBaseUrl()+"/cart/CartItems/"+a,{data:JSON.stringify(i),contentType:"application/json",type:"PUT",success:function(){s.getCartItem(s.cartId);s.getCartDetail(s.cartId)}})}},onEditCartNoClicked:function(t){var e=t.getSource();var a=jQuery.sap.byId(e.oParent.sId).find("[name='cartNo']").val();var r=this;var o={ID:this.cartId,CardNo:a};jQuery.ajax(r.getBaseUrl()+"/cart/Carts/"+this.cartId,{contentType:"application/json",type:"PUT",data:JSON.stringify(o),success:function(t){r.getCartDetail(r.cartId)}})},getCartItem:function(t){var a=this;jQuery.ajax(a.getBaseUrl()+"/cart/CartItems?$filter=parent_ID eq "+t+"&$expand=product",{contentType:"application/json",type:"GET",success:function(t){var r=new e(t);a.setModel(r,"cartItemsModel");console.log("cartItemsModel",r)}})},getCartDetail:function(t){var a=this;jQuery.ajax(a.getBaseUrl()+"/cart/Carts("+this.cartId+")?&$expand=Items",{contentType:"application/json",type:"GET",success:function(t){var r=new e(t);console.log("cartDetaiModel",r);a.setModel(r,"cartDetailModel");var o=t.Items;console.log("items",o)}})}})});