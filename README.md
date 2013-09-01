# Description

This library checks if a string is included in a picture.
Simply provide a picture and a reference text.

# Installation

Install ImageMagick (>= 6.8.0-10) for image format conversion, crop, enhance contrast or brigthness:

    brew install imagemagick

Install leptonica (>= 1.69) and tesseract (>= 3.02.02) for OCR:

    brew install leptonica
    brew install tesseract --all-languages

Or install without `--all-languages` and [install them manually as needed](http://blog.philippklaus.de/2011/01/chinese-ocr/).

Then, install lib dependencies:

    npm install

# Use it

    var ocrt = require('../lib/ocrt');
    var result = ocrt.process("image.png", "text to be checked");

# The way it works

This library uses Tesseract OCR to extract text in a picture. As recognitions errors may happen, a Levenshtein distance algorithm is used to verify that string extract from the picture and the text given as a reference are similar enough.

# Criteria

As the distance ratio (distance / max (string1.length, string2.length) can be higher for a short string for the same amount of errors, comparison criterais have been applied.

The likeness ratio (as a percentage) is defined as :

    1 - distance / Max(str1.length, str2.length)

* For strings shorter than 10 characters, two string are proven to be equal if likness ratio is greater than 80%
* For strings between 10 and 20 characters, two string are proven to be equal if likness ratio is greater than 85%
* For strings longer than 20 characters, two string are proven to be equal if likness ratio is greater than 90%

# References

* https://github.com/desmondmorris/node-tesseract
* https://github.com/gf3/Levenshtein









