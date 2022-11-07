sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	'sap/ui/core/Fragment',
	"DynamicTable/DynamicTable/controller/variant"

], function(Controller, Sorter, Filter, Fragment, variant) {
	"use strict";
	var oModel;
	var path;
	var oFragment;
	var filter;
	var group;
	return Controller.extend("DynamicTable.DynamicTable.controller.Main", {
		onInit: function() {

			oModel = this.getOwnerComponent().getModel("MainModel");
			createTable();
			fetch('https://fakestoreapi.com/products')
				.then(res => res.json())
				.then(json => oModel.setProperty("/ProductCollection", json))

		},
		closeVariant: function() {
			this.oVariant.close();
		},
		openVariant: function() {
			var variants = [];
			readVariants().then(res => {
				res.forEach(e => {
					variants.push(e);
				})
				oModel.setProperty("/variant", variants)
				if (!this.oVariant) {
					this.oVariant = sap.ui.xmlfragment("DynamicTable.DynamicTable.view.Variant", this);
				}
				this.getView().addDependent(this.oVariant);
				this.oVariant.open();
			});

		},
		saveVariant: function() {
			var oTable = this.getView().byId("idProductsTable");
			filter = oTable.getBinding("items");
			var name = oModel.getProperty("/variantname");
			var variant = {};
			var variants = [];
			var filterString = "";

			if (filter.aApplicationFilters[0]) {
				filter.aApplicationFilters.forEach(a => {
					filterString += a.sPath + "___" + a.sOperator + "___" + a.oValue1 + "___" + a.oValue2;
				})
			} else if (filter.aFilters[0]) {
				filter.aFilters.forEach(a => {

					filterString += a.sPath + "___" + a.sOperator + "___" + a.oValue1 + "___" + a.oValue2 + '.';
				})
			} else {
				filterString = null
			}

			variant = {
				name: name,
				id: Math.floor(Math.random() * 100),
				filter: filterString,
				sort: filter.aSorters[0].sPath + "___" + filter.aSorters[0].bDescending,
				group: true
			}
			addVariant(variant).then(e => {
				sap.m.MessageBox.show("variant eklendi")
				readVariants().then(res => {
					res.forEach(e => {
						variants.push(e);
					})
					oModel.setProperty("/variant", variants)
				});
			})

		},
		closeList: function() {
			this.oVariantList.close();
		},
		openVariantList: function() {
						var variants = [];
			readVariants().then(res => {
				res.forEach(e => {
					variants.push(e);
				})
				oModel.setProperty("/variant", variants)
				if (!this.oVariantList) {
				this.oVariantList = sap.ui.xmlfragment("DynamicTable.DynamicTable.view.variantList", this)
			}
				this.getView().addDependent(this.oVariantList);
			this.oVariantList.open();
			});
		
			
		
		},
		confirmVariant: function() {
			var e = sap.ui.getCore().byId("idList");
			var selected = e.getSelectedIndex();
			var idSelected = e.getRows()[selected].getCells()[0].getText()

			var id = parseInt(idSelected);
			var variant;
			getVariant(id).then(res => {
				variant = res;
				var oTable = this.byId("idProductsTable"),
					aGroups = [],
					oBinding = oTable.getBinding("items"),
					variantSort = variant.c1,

					variantGroup = variant.c2.split("___"),
					variantFilter = variant.c3;
				if (variantFilter != null) {
					var s = "";
					var variantsFilter = variant.c3.split('.');
					variantsFilter.forEach(a => {
						variantFilter = a.split("___");
						aGroups.push(new Filter(variantFilter[0], variantFilter[1], variantFilter[2], variantFilter[3]));

						s += variantFilter[2] + ",";
					})
					this.byId("vsdFilterBar").setVisible(true);
					this.byId("vsdFilterLabel").setText(s);

				}
				oBinding.filter(aGroups);
				if (variantSort != null) {
					variantSort = variant.c1.split("___");
					oBinding.sort(new Sorter(variantSort[0], variantSort[1], true))

				} else {
					oBinding.sort(new Sorter("title", false, false))
				}
			
			})

			this.closeVariant();
			this.resetFilterItems();
		},
		resetFilterItems: function() {
			// this.oFilter._onClearFilters(); //reset filter ite
			var aFilterItems = this.oFilter.getFilterItems();
			aFilterItems.forEach(function(item) {
				var aItems = item.getItems();
				aItems.forEach(function(i) {
					// if (i == "electronics") {
					// 	i.setSelected(true);
					// }
					i.setSelected(false);
				});
			});
		},

		handleSortButtonPressed: function() {
			var oTable = this.getView().byId("idProductsTable");
			filter = oTable.getBinding("items")
			var filters = {
				sorter: filter.aSorters[0]
			};
			filter.sort(new Sorter(filters.sorter.sPath, filters.sorter.bDescending, filters.sorter.vGroup));
			path = "DynamicTable.DynamicTable.view.sort";
			var oTable = this.getView().byId("idProductsTable");
			var cells = this.getView().byId("c1").getCells();
			var columns = oTable.getColumns();
			if (!this.oSort) {
				this.oSort = sap.ui.xmlfragment(path, this); //fragmentim
				for (var i = 0; i < cells.length; i++) {
					var a;
					try {
						a = this.getView().byId("c1").getCells()[i].getBindingInfo("text").parts[0].path;
					} catch (err) {
						a = "image";
					}
					if (cells.length != this.oSort.getSortItems().length) {
						this.oSort.addSortItem(new sap.m.ViewSettingsItem({
							key: a,
							text: columns[i].getHeader().getProperty("text")
						}))
					}
				}
				var x = filters.sorter.sPath;
				this.oSort.setSelectedSortItem(x);
			}

			this.getView().addDependent(this.oSort);
			this.oSort.open();
		},
		handleFilterButtonPressed: function(oEvent) {
			path = "DynamicTable.DynamicTable.view.filter";
			var oTable = this.getView().byId("idProductsTable");
			var cells = this.getView().byId("c1").getCells();
			var columns = oTable.getColumns();
			if (!this.oFilter) {
				this.oFilter = sap.ui.xmlfragment(path, this); //fragmentim
				if (cells) {
					for (var i = 0; i < cells.length; i++) {
						var a;
						try {
							a = this.getView().byId("c1").getCells()[i].getBindingInfo("text").parts[0].path;
						} catch (err) {
							a = "image";
						}
						if (cells.length != this.oFilter.getFilterItems().length) {
							var d = new sap.m.ViewSettingsFilterItem({
								key: a,
								text: columns[i].getHeader().getProperty("text")
							});
							this.oFilter.addFilterItem(d);
						}
					}
					this.setCategory();
				}
			}
			this.getView().addDependent(this.oFilter);
			this.oFilter.open();

		},
		setCategory: function() {
			var oTable = this.getView().byId("idProductsTable");
			var s = this.oFilter.mAggregations.filterItems[2];
			s.removeAllItems()
			var d = s.getKey();
			var model = oModel.getProperty("/ProductCollection");
			var items = new Set(model.map(e => e[d]))
			if (items.size != s.getItems().length) {
				items.forEach(e => {
					s.addItem(new sap.m.ViewSettingsItem({
						key: (d + "___EQ___" + e + "___X"),
						text: e
					}))
				});
			}

			this.oFilter.setSelectedFilterCompoundKeys({
				"category": {
					"category___EQ___electronics___X": true
				}
			});

		},
		setFilterItem: function(oEvent) {
			var oTable = this.getView().byId("idProductsTable");
			oTable.aFilters = null;
			var s = oEvent.getParameter("parentFilterItem");
			var d = s.getKey();
			var model = oModel.getProperty("/ProductCollection");
			var items = new Set(model.map(e => e[d]))
			if (items.size != s.getItems().length) {
				items.forEach(e => {
					s.addItem(new sap.m.ViewSettingsItem({
						key: (d + "___EQ___" + e + "___X"),
						text: e
					}))
				});
			}
		},
		handleGroupButtonPressed: function() {
			path = "DynamicTable.DynamicTable.view.group";
			var oTable = this.getView().byId("idProductsTable");
			var cells = this.getView().byId("c1").getCells();
			var columns = oTable.getColumns();
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(path, this);
				for (var i = 0; i < cells.length; i++) {
					var a;
					try {
						a = this.getView().byId("c1").getCells()[i].getBindingInfo("text").parts[0].path;
					} catch (err) {
						a = "image";
					}
					if (cells.length != this.oDialog.getGroupItems().length) {
						this.oDialog.addGroupItem(new sap.m.ViewSettingsItem({
							key: a,
							text: columns[i].getHeader().getProperty("text")
						}))
					}

					this.oDialog.setSelectedGroupItem("category");

				}
			}
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
		},
		handleSortDialogConfirm: function(oEvent) {

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
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];
			mParams.filterItems.forEach(function(oItem) { //price için le bt gt parametreleri category için eq parametresi kullandım.
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
		setVariantTable: function() {
			//tablo oluşturup variant değrlerini ayarlamak
		},
		handleGroupDialogConfirm: function(oEvent) {
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
				//group kaydedildiğinde group bilgileri burada tutalacak
				//return ettiği değeri database kaydetmesi gerekiyor ama fonksiyonla birlikte yazıyı alıyor

				vGroup = function(oContext) { //Alanın modelinden hangi item olduğu geliyor  gruplama parametresi olarak kullanılıyor

					var name = oContext.getProperty(sPath)

					return {
						text: name,
						key: name
					}
				};
				group = {
					spath: sPath,
					bDescending: bDescending
				};

				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				oBinding.sort(aGroups);
			} else {
				oBinding.sort(); // gruplama silme
			}

		}
	});

});