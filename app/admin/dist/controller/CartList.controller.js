sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/table/RowAction","sap/ui/table/RowActionItem","sap/ui/table/RowSettings","sap/m/MessageToast","sap/ui/core/Fragment","./BaseController","sap/ui/model/odata/v4/ODataModel"],function(e,t,o,a,n,i,r,s,l){"use strict";return s.extend("admin.controller.CartList",{onInit:function(){this._oStorage=jQuery.sap.storage(jQuery.sap.storage.Type.local);var e=this.handleActionPress.bind(this);this.newCartDialog=null;this.modes=[{key:"Navigation",text:"Navigation",handler:function(){var t=new o({items:[new a({type:"Navigation",press:e,visible:"{Available}"})]});return[1,t]}},{key:"NavigationDelete",text:"Navigation & Delete",handler:function(){var t=new o({items:[new a({type:"Navigation",press:e,visible:"{Available}"}),new a({type:"Delete",press:e})]});return[2,t]}},{key:"None",text:"No Actions",handler:function(){return[0,null]}}];this.getView().setModel(new t({items:this.modes}),"modes");this.switchState("Navigation")},onAfterRendering:function(){var e=this;var t=this._oStorage.get("baseModel");var o=JSON.parse(t);var a=500;setTimeout(function(){var t=e.getView().byId("table");console.log("table",t);var a=t.getRows();console.log("items",a);for(var n=0;n<a.length;n++){var i=a[n].getBindingContext();if(i){var r=i.getObject();if(r.ID===o.ID){t.setSelectedIndex(n)}}}},a)},onNavIndicatorsToggle:function(e){var t=this.byId("table");var o=e.getSource();if(o.getPressed()){t.setRowSettingsTemplate(new n({navigated:"{NavigatedState}"}))}else{t.setRowSettingsTemplate(null)}},onBehaviourModeChange:function(e){this.switchState(e.getParameter("selectedItem").getKey())},switchState:function(e){var t=this.byId("table");var o=0;var a=t.getRowActionTemplate();if(a){a.destroy();a=null}for(var n=0;n<this.modes.length;n++){if(e==this.modes[n].key){var i=this.modes[n].handler();o=i[0];a=i[1];break}}t.setRowActionTemplate(a);t.setRowActionCount(o)},handleActionPress:function(e){var t=e.getParameter("row");var o=e.getParameter("item");var a=e.getSource();var n=a.getBindingContext();var i=n.getProperty("ID");console.log("cartId",i);console.log("oRow",t);console.log("oItem",o.getType());var r=this;if(o.getType()==="Navigation"){this.getRouter().navTo("RouteCartDetail",{cartId:i})}else if(o.getType()==="Delete"){console.log("Delete cart");var s=this.getView().getModel().bindList(`/Carts`);s.requestContexts().then(function(e){e.forEach(function(e){if(e.getProperty("ID")===i){e.delete().then(function(){var e=r.getView().getModel();e.refresh()})}})})}},handleNewPress:function(e){var o=new Date;var a=o.getFullYear()+"-"+(o.getMonth()<8?"0"+o.getMonth():o.getMonth())+"-"+(o.getDate()>9?o.getDate():"0"+o.getDate());var n=new t({cartNo:a,total:0});if(!this.newCartDialog){this.newCartDialog=r.load({id:"newCartDialog",name:"admin.view.NewCartDialog",controller:this})}this.newCartDialog.then(function(e){console.log("dialog",e);e.setModel(n);var t=e.getModel();console.log("model",t);e.open()})},onDialogCancelClicked:function(e){this.newCartDialog.then(function(e){e.close()})},onRefresh:function(){var e=this.byId("table");e.getBinding("rows").refresh()},onDialogOkClicked:function(e){var t=this;this.newCartDialog.then(function(e){console.log("oData",e.getModel().oData);var o={CardNo:e.getModel().oData.cartNo,total:0};console.log("data",o);var a=new l({groupId:"$auto",synchronizationMode:"None",serviceUrl:t.getBaseUrl()+"/admin/"});var n=a.bindList("/Carts",undefined,undefined,undefined,{$$updateGroupId:"CreateCart"});var i=n.create(o);i.created();a.submitBatch("CreateCart").then(function(){t.onRefresh();e.close()})})},selectionChangeHandler:function(e){var t=e.getSource().getSelectedIndex();var o=e.getSource().getRows()[t].getBindingContext().getObject();this._oStorage.put("baseModel",JSON.stringify(o))}})});