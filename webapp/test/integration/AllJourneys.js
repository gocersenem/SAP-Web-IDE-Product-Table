/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"DynamicTable/DynamicTable/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"DynamicTable/DynamicTable/test/integration/pages/Worklist",
	"DynamicTable/DynamicTable/test/integration/pages/Object",
	"DynamicTable/DynamicTable/test/integration/pages/NotFound",
	"DynamicTable/DynamicTable/test/integration/pages/Browser",
	"DynamicTable/DynamicTable/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "DynamicTable.DynamicTable.view."
	});

	sap.ui.require([
		"DynamicTable/DynamicTable/test/integration/WorklistJourney",
		"DynamicTable/DynamicTable/test/integration/ObjectJourney",
		"DynamicTable/DynamicTable/test/integration/NavigationJourney",
		"DynamicTable/DynamicTable/test/integration/NotFoundJourney",
		"DynamicTable/DynamicTable/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});