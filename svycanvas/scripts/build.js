var AdmZip = require('adm-zip');

// creating archives
var zip = new AdmZip();

zip.addLocalFolder("./META-INF/", "/META-INF/");
zip.addLocalFolder("./dist/", "/dist/");
zip.addLocalFolder("./Canvas/", "/Canvas/");

zip.writeZip("svycanvas.zip");