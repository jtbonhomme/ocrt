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
     *                     0 means that the image does not contain the string
     *                     1 means that the string is included in the image
     *                     -1 means that arguments are not corrects
     *
     * @return             0 means that the image does not contain the string
     *                     1 means that the string is included in the image
     *                     -1 means that arguments are not corrects
     *
     */
    process: function (image, str, crop, callback) {
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

        var ocrStr = "";
        var l = this.likeness(ocrStr, str);

        // check likeness according to string lengths (see README.md)
        if( str.length <= 10                     && l >= 85 ||
            str.length >  10 && str.length <= 20 && l >= 90 ||
            str.length >  20                     && l >= 95) {
            res = 1;
        }
        return res;
    },

    /**
     *
     * @arg str1, str2     String to be compared
     *
     * @return             rounded(1 - levenshtein_distance(str1,str2) / max(str1, str2)*100)
     *
     */
    likeness: function(str1, str2) {
        var d = new Levenshtein(str1, str2);
        return Math.round(100 - (d.distance*100)/Math.max(str1.length, str2.length));
    }
};

module.exports = ocrt;
