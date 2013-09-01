// dependencies
var Levenshtein = require('Levenshtein'),
    exec    = require('child_process').exec,
    fs      = require('fs'),
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
     * @arg lang           [optionnal] A language code
     *
     * @arg callback       [optionnal] A function pointer
     *                     This function is called after the process end, with a possible
     *                     error as first and the comparison result (see @return for values)
     *
     * @return             0 means that the image does not contain the string
     *                     1 means that the string is included in the image
     *                     -1 means that arguments are not corrects or image has not the right format
     *                     -2 means that something went wrong will creating temporary file or running command
     *
     */
    process: function (image, str, crop, lang, callback) {
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

        // Preprocess the image with ImageMagick 'convert' (This requires ImageMagick to be installed)
        console.log("ocrt: process: step 0, preprocess (todo)");
        // todo

       // Recognise text supposed to be in a single uniform block of text
       console.log("ocrt: process: step 1, process ocr in image " + image);
        
        // generate output file name (tesseract exports recognized text in a output file)
        tmp.tmpName(function(err, output) {
            if(err) {
                // Something went wrong when generating the temporary filename
                callback(err, null);
                return -2;
            }
            // tesseract -l fra FI-Titre.png FI-Titre
            var command = [ocrt.tesseract.binary];
            if( typeof lang !== "undefined" &&
                lang !== null ) {
                console.log("ocrt: process: language option : " + lang);
                command.push("-l");
                command.push(lang);
            }
            command.push(image);

            // finalize command
            command = command.join(' ');

            // exec command
            console.log("ocrt: process: run command : " + command);
            exec(command, function(err, stdout, stderr){
                if(err) {
                  // Something went wrong executing the assembled command
                  callback(err, null);
                  return -2;
                }
                var outputFile = output + '.txt';
                fs.readFile(outputFile, function(err, data) {
                    if(!err) {
                      // There was no error, so get the text
                      data = data.toString(tesseract.outputEncoding);
                    }
                    console.log("ocrt: process: Deleting '"+outputFile+"'");
                    fs.unlink(outputFile, function (err) {
                      // ignore any errors here as it just means we have a temporary file left somewehere
                    });

                    // We got the result (or an error)
                    console.log("ocrt: process: step 2, compute likeness ratio");
                    // get likeness ratio between string recognized in OCR and the one in paramter
                    var l = ocrt.likeness(ocrStr, str);
            
                    console.log("ocrt: process: step 3, validate likeness ratio");
                    // check likeness according to string lengths (see README.md)
                    if( str.length <= 10                     && l >= 85 ||
                        str.length >  10 && str.length <= 20 && l >= 90 ||
                        str.length >  20                     && l >= 95) {
                        res = 1;
                    }
                    callback(err, data);
                }); // end reaFile
            }); // end exec
        }); // end output filename

        
        console.log("ocrt: process: result : " + res);
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
        console.log("ocrt: likeness: lenvenshtein distance : " + d);
        return Math.round(100 - (d.distance*100)/Math.max(str1.length, str2.length));
    },

    /**
     *
     * @arg inputFile      Name of the file to be processed
     *
     * @arg callback       Function to be called after processing
     *
     */
    convert: function(inputFile, callback) {
        console.log("ocrt: convert: Processing '"+inputFile+"'");
        tmp.tmpName({postfix: '.tif'}, function(err, outputFile) {
        if(err) {
            // Something went wrong when generating the temporary filename
            callback(err, null);
            return;
        }
      
        var command = ['convert', '-type','Grayscale', '-resize','200%', '-sharpen','10', inputFile, outputFile].join(' ');
        console.log("ocrt: convert: Running '"+command+"'");
        exec(command, function(err, stdout, stderr){
          if(err) {
            // Something went wrong executing the convert command
            callback(err, null);
          } else {
            var cleanup = function() {
              console.log("ocrt: convert: Deleting '"+outputFile+"'");
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
