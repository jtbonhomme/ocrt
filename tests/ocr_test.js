var ocrt = require('../lib/ocrt.js');

var image    = "./picture.png";
var language = "fra";
var refStr   = "Retour sur l'apparition de nouveaux géants essentiellement découverts en Afrique, comme le spinosaure, l'argentinosaure ou encore le Predator X.";
var crop = {
	x: 10,
	y: 10,
	w: 10,
	h: 10
};

ocrt.process(image, refStr, crop, function(err, result) {
    if(err) {
        console.error(err);
    } else {
        console.log("Comparison result : " + result);
    }
});
