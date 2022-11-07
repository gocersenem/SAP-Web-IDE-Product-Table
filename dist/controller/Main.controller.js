sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	'sap/ui/core/Fragment'
], function(Controller, Sorter, Filter, Fragment) {
	"use strict";
	var oModel;
	var path;
	return Controller.extend("DynamicTable.DynamicTable.controller.Main", {
		onInit: function() {
			oModel = this.getOwnerComponent().getModel("MainModel");
			fetch('https://fakestoreapi.com/products')
				.then(res => res.json())
				.then(json => oModel.setProperty("/ProductCollection", json))
		},
		handleSortButtonPressed: function() {
			path = "DynamicTable.DynamicTable.view.sort";
			if (!this.pDialog) {
				this.pDialog = sap.ui.xmlfragment(path, this);
			}
			this.getView().addDependent(this.pDialog);
			this.pDialog.open();
		},
		handleFilterButtonPressed: function() {
			var category = [];
			var list = oModel.getProperty("/ProductCollection");
			const essiz = list //modelden tekrarlayan verileri eliyoruz.
				.map(e => e.category)
				.map((e, i, final) => final.indexOf(e) === i && i)
				.filter(e => list[e]).map(e => list[e]);
			category = essiz;
			oModel.setProperty("/category", category);
			path = "DynamicTable.DynamicTable.view.filter";
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(path, this);
			}
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
		},
		handleGroupButtonPressed: function() {
			path = "DynamicTable.DynamicTable.view.group";
			if (!this.sDialog) {
				this.sDialog = sap.ui.xmlfragment(path, this);
			}
			this.getView().addDependent(this.sDialog);
			this.sDialog.open();
		},
		handleSortDialogConfirm: function(oEvent) {
			oModel = this.getOwnerComponent().getModel("MainModel");
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		handleFilterDialogConfirm: function(oEvent) {
			oModel = this.getOwnerComponent().getModel("MainModel");
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];
			mParams.filterItems.forEach(function(oItem) {//price için le bt gt parametreleri category için eq parametresi kullandım.
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2)
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},
		handleGroupDialogConfirm: function(oEvent) {
			this.mGroupFunctions = {
				category: function(oContext) {
					var name = oContext.getProperty("category"); //Alanın modelinden category geliyor 
					return {
						key: name,
						text: name
					};
				},
				price: function(oContext) {
					var price = oContext.getProperty("price");
					var key, text;
					if (price <= 100) {
						key = "LE100";
						text = "100 " + " or less";
					} else if (price <= 1000) {
						key = "BT100-1000";
						text = "Between 100 and 1000 ";
					} else {
						key = "GT1000";
						text = "More than 1000 ";
					}
					return {
						key: key,
						text: text
					};
				}
			}
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				oBinding.sort(aGroups);
			} else  {
				oBinding.sort(); // gruplama silme
				this.groupReset = true;
			}
		}
	});

});