let db = openDatabase("variantD", "1.0", "variantD", 2 * 1024 * 1024);
// db.transaction(function(a) {
// 	// a.executeSql("drop table denem")
// 	a.executeSql("CREATE TABLE IF NOT EXISTS denem(id unique,c1,c2,c3)", [], function(a, result) {})
// });
function createTable() {
	return new Promise((resolve, reject) => {
	
		db.transaction(function(a) {
			// a.executeSql("Drop table denem")
			a.executeSql("CREATE TABLE IF NOT EXISTS denem(id unique,na,c1,c2,c3)", [], function(a, result) {
				resolve("başarılı")
			}, function(a, eror) {
				reject("başarısız")
			});
		});
	})

}
//read variant
function readVariants() {
	return new Promise((resolve, reject) => {
		db.transaction((e) => {

			e.executeSql("select * from denem ", [], (e, result) => {
				var variants = [];
				for (var i = 0; i < result.rows.length; i++) {
					var e = {
						id: result.rows.item(i).id,
						name: result.rows.item(i).na,
						sort: result.rows.item(i).c1,
						group: result.rows.item(i).c2,
						filter: result.rows.item(i).c3
					}
					variants.push(e);
				}
				resolve(variants);
			}, function() {
				reject(console.error("data okunurken hata oluştu"));
			})
		})
	})
}

// get variant 

function getVariant(id) {
	var variant;
	return new Promise(function(resolve, reject) {
		db.transaction(function(e) {
			e.executeSql("select * from denem where id = ?", [id], (e, result) => {
				variant = result.rows.item(0);
				resolve(variant);
			}, () => {
				reject(console.error("hata"))
			})
		})
	})
}
// add variant 
function addVariant(variant) {
	return new Promise((resolve, reject) => {
		db.transaction(function(e) {
			e.executeSql("Insert into denem(id,na,c1,c2,c3) values (?,?,?,?,?)", [variant.id, variant.name, variant.sort, variant.group, variant.filter],
				(a) => {
					resolve("başarılı")

				}, (a) => {
					reject("başarısız")
				})

		})
	})
}