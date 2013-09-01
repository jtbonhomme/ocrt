// dependencies
var Levenshtein = require('Levenshtein'),
    exec    = require('child_process').exec,
    fs      = require('fs'),
//    nodecr = require('node-tesseract'),
//    nodecr = require('./node_modules/node-tesseract/lib/tesseract.js'),
    crypto = require('crypto'),
    tmp     = require('tmp');

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
        console.log("ocrt: process: start ocr with tesseract");
        ocrt._process(image, str, crop, lang, function(err, result){
            console.log("ocrt: process: err    : " + err);
            console.log("ocrt: process: result : " + result);
            
            if(err) {
                console.log("ocrt: process: return -1");
                callback(err, -1);
                return;
            }
            else {
                // We got a result
                console.log("ocrt: process: compute likeness ratio with result : " + result);
                // get likeness ratio between string recognized in OCR and the one in paramter
                var l = ocrt._likeness(result, str);

                console.log("ocrt: process: validate likeness ratio : " + l);
                // check likeness according to string lengths (see README.md)
                if( str.length <= 10                     && l >= 85 ||
                    str.length >  10 && str.length <= 20 && l >= 90 ||
                    str.length >  20                     && l >= 95) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
    },

    _process: function (image, str, crop, lang, callback) {
        var res = 0;
        console.log("ocrt: _process: begin");
        // check args
        if( image        === "" ||
            str          === "" ||
            image        === null ||
            typeof image === 'undefined' ||
            str          === null ||
            typeof str   === 'undefined') {
            console.log("ocrt: _process: bad parameters");
            callback("ocrt: _process: bad parameters");
            return;
        }
        
        // Recognise text of any language in any format
        var date = new Date().getTime();
        var output = crypto.createHash('md5').update( image + date ).digest("hex") + '.tif';
        console.log("ocrt: _process: exec convert");
        exec("convert " + image + " -resize 300% -brightness-contrast 50x50 -type Grayscale " + output, function(err, stdout, stderr){
            if(err) throw err;
            console.log("ocrt: _process: no err during convert");
            exec("tesseract " + output + " " + output + " -psm 6", function(err, stdout, stderr){
                console.log("ocrt: _process: tesseract: stdout: " + stdout);
                console.log("ocrt: _process: tesseract: stderr: " + stderr);
                if(err) throw err;
                fs.readFile(output + '.txt', function(err,data){
                    if(err) throw err;
                    text = data.toString('ascii').replace(/\W/g, '');
                    fs.unlink(output + '.txt', function (err) {
                        if (err) throw err;
                        fs.unlink(output, function (err) {
                            if (err) throw err;
                        }); // end unlink
                    }); // end unlink
                    callback(null, text);
                    return;
                }); // end readFile
            }); // end exec tesseract
        }); // end exec convert
        console.log("ocrt: _process: end");
    },

    /**
     *
     * @arg str1, str2     String to be compared
     *
     * @return             rounded(1 - levenshtein_distance(str1,str2) / max(str1, str2)*100)
     *
     */
    _likeness: function(str1, str2) {
        console.log("ocrt: _likeness: string1 : " + str1);
        console.log("ocrt: _likeness: string2 : " + str2);
        var d = new Levenshtein(str1, str2);
        console.log("ocrt: _likeness: lenvenshtein distance : " + d);
        return Math.round(100 - (d.distance*100)/Math.max(str1.length, str2.length));
    },

    /**
     *
     * @arg inputFile      Name of the file to be processed
     *
     * @arg callback       Function to be called after processing
     *
     */
    _convert: function(inputFile, callback) {
        console.log("ocrt: _convert: Processing '"+inputFile+"'");
        tmp.tmpName({postfix: '.tif'}, function(err, outputFile) {
        if(err) {
            // Something went wrong when generating the temporary filename
            callback(err, null);
            return;
        }
      
        var command = ['convert', '-type','Grayscale', '-resize','200%', '-sharpen','10', inputFile, outputFile].join(' ');
        console.log("ocrt: _convert: Running '"+command+"'");
        exec(command, function(err, stdout, stderr){
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if(err) {
              // Something went wrong executing the convert command
              callback(err, null);
            } else {
              var cleanup = function() {
                console.log("ocrt: _convert: Deleting '"+outputFile+"'");
                fs.unlink(outputFile, function (err) {
                  // ignore any errors here as it just means we have a temporary file left somewehere
                });
              };
              callback(null, outputFile, cleanup);
            }
        }); // end exec
      }); // end output filename generation
    }

};

module.exports = ocrt;
