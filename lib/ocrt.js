// dependencies
var Levenshtein = require('Levenshtein'),
    exec    = require('child_process').exec,
    fs      = require('fs'),
    crypto = require('crypto');

var ocrt = {

    tesseract: {
        binary: "tesseract"
    },

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
     * @arg callback       A function pointer
     *                     This function is called after the process end, with a possible
     *                     error as first and the comparison result (see @return for values)
     *
     * @arg lang           [optionnal] A language code
     *
     * @arg callback       A function pointer
     *                     This function is called after the process end, with a possible
     *                     error as first and the comparison result :
     *                         0 means that the image does not contain the string
     *                         1 means that the string is included in the image
     *                         -1 means that arguments are not corrects or image has not the right format
     *
     */

    process: function (image, str, crop, lang, callback) {
        ocrt._process(image, str, crop, lang, function(err, result){
            
            if(err) {
                callback(err, -1);
                return;
            }
            else {
                // We got a result
                // get likeness ratio between string recognized in OCR and the one in paramter
                var l = ocrt._likeness(result, str);

                // check likeness according to string lengths (see README.md)
                if( str.length <= 10                     && l >= 80 ||
                    str.length >  10 && str.length <= 20 && l >= 85 ||
                    str.length >  20                     && l >= 90) {
                    callback(null, 1);
                    return;
                }
                else {
                    callback(null, 0);
                    return;
                }
            }
        });
    },

    _process: function (image, str, crop, lang, callback) {
        var res = 0;
        // check args
        if( image        === "" ||
            str          === "" ||
            image        === null ||
            typeof image === 'undefined' ||
            str          === null ||
            typeof str   === 'undefined') {
            callback("ocrt: _process: bad parameters");
            return;
        }
        
        // Recognise text of any language in any format
        var date = new Date().getTime();
        var output = crypto.createHash('md5').update( image + date ).digest("hex") + '.tif';
        // to do : call ocrt._convert
        var command = "convert " + image + " -resize 300% -brightness-contrast 50x50 -type Grayscale ";
        if( crop ) {
            command = command + "-crop " + crop.w + "x" +
                                           crop.l + "+" +
                                           crop.x + "+" +
                                           crop.y + " ";
        }
        command = command + output;
        exec(command, function(err, stdout, stderr){
            if(err) {
                callback(err, null);
                return;
            }
            exec("tesseract " + output + " " + output + " -psm 6", function(err, stdout, stderr){
                if(err) {
                    callback(err, null);
                    return;
                }
                fs.readFile(output + '.txt', function(err,data){
                    if(err) {
                        callback(err, null);
                        return;
                    }
                    //text = data.toString('ascii').replace(/\W/g, '');
                    text = data.toString('ascii').replace(/\n/g, '');
                    fs.unlink(output + '.txt', function (err) {
                        if(err) {
                            callback(err, null);
                            return;
                        }
                        fs.unlink(output, function (err) {
                            if(err) {
                                callback(err, null);
                                return;
                            }
                        }); // end unlink
                    }); // end unlink
                    callback(null, text);
                    return;
                }); // end readFile
            }); // end exec tesseract
        }); // end exec convert
    },

    /**
     *
     * @arg str1, str2     String to be compared
     *
     * @return             rounded(1 - levenshtein_distance(str1,str2) / max(str1, str2)*100)
     *
     */
    _likeness: function(str1, str2) {
        var d = new Levenshtein(str1, str2);
        return Math.round(100 - (d.distance*100)/Math.max(str1.length, str2.length));
    }

};

module.exports = ocrt;
