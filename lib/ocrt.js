// dependencies
var Levenshtein = require('Levenshtein');
var nodecr = require('node-tesseract');

var ocrt = {
	/**
     *
     * @arg image          Full name of the image that contain text to be recognized.
     *
     * @arg str            The string to be compared with.
     *
     * @arg crop           [optionnal] Object that indicate a part of the ipcture
     *                     to be cropped before the test:
     *                     var crop = {
     *                       x: 10,
     *                       y: 10,
     *                       w: 10,
     *                       h: 10
     *                     };
     *
     * @arg callback       [optionnal] A function pointer
     *                     This function is called after the process end, with a possible
     *                     error as first and the comparison result.
     *                     0 mean that the image does not contain the string
     *                     1 mean that the string is included in the image
     *
     */
    process : function (image, str, crop, callback) {
        var res = 0;
        // check args
        if( image        === "" ||
            str          === "" ||
            image        === null ||
            typeof image === 'undefined' ||
            str          === null ||
            typeof str   === 'undefined') {
            return -1;
        }

        return res;
    }
/*
var str11 = "Retour sur Fapparition de nouveaux géants \nessentiellement découverts en Afrique, comme le \nspinosaure, Pargentinosaure ou encore le Predator X.";
var str12 = "Retour sur l'apparition de nouveaux géants essentiellement découverts en Afrique, comme le spinosaure, l'argentinosaure ou encore le Predator X.";
var l1 = new Levenshtein(str11, str12);
console.log("Distance str1 : " + l1.distance + " / " + str11.length + " : " +
            Math.round(100 - (l1.distance*100)/Math.max(str11.length, str12.length)) + "%");
*/

};

module.exports = ocrt;
