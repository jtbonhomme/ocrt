var ocrt          = require('../lib/ocrt');
var should        = require('should');

var image         = "./tests/picture.png";
var fooImage      = "./foo.png";
var croppedImage  = "./tests/cropped_picture.png";
var language      = "fra";
var refStr        = "Retour sur l'apparition de nouveaux géants essentiellement découverts en Afrique, comme le spinosaure, l'argentinosaure ou encore le Predator X.";
var refStrX       = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
var crop          = {
	x: 950,
	y: 1110,
	w: 2000,
	l: 350
};

describe('ocrt.process', function() {
    this.timeout(20000);
    describe('with no arguments', function() {
        it('returns -1', function() {
            ocrt.process(null, null, null, null, function(err, result){
                result.should.eql(-1);
            });
        });
    });

    describe('with a null image', function() {
        it('returns -1', function() {
            ocrt.process(null, refStrX, null, null, function(err, result){
                result.should.eql(-1);
            });
        });
    });

    describe('with an image, a null reference string', function() {
        it('returns -1', function() {
            ocrt.process(image, null, null, null, function(err, result){
                result.should.eql(-1);
            });
        });
    });

    describe('with a full image', function() {
        it('returns 0', function(done) {
            ocrt.process(image, refStrX, null, null, function(err, result){
                result.should.eql(0);
                done();
            });
        });
    });

    describe('with an image that does not exist', function() {
        it('returns -1', function(done) {
            ocrt.process(fooImage, refStrX, null, null, function(err, result){
                result.should.eql(-1);
                done();
            });
        });
    });

    describe('with a cropped image and a reference string not included in the image', function() {
        it('returns 0', function(done) {
            ocrt.process(croppedImage, refStrX, null, null, function(err, result){
                result.should.eql(0);
                done();
            });
        });
    });

    describe('with a cropped image and a reference string included in the image', function() {
        it('returns 1', function(done) {
            ocrt.process(croppedImage, refStr, null, null, function(err, result){
                result.should.eql(1);
                done();
            });
        });
    });

    describe('with an image to be cropped, a reference string included in the image and a "fra" language', function() {
        it('returns 1', function(done) {
            ocrt.process(image, refStr, crop, "fra", function(err, result){
                result.should.eql(1);
                done();
            });
        });
    });

});