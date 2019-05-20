// Number of iterations
const maxIter = 1000;

// Complex coordinates to render within
/*const windowXMin = 0.001643721965;
const windowXMax = 0.001643721980;
const windowYMin = -0.8224676333025;
const windowYMax = -0.8224676332950;*/
const windowXMin = -2.5;
const windowXMax = 1;
const windowYMin = -1;
const windowYMax = 1;

let x, y;
let palette;

let rendering = false;

onmessage = (e) => {
    let msg = e.data;
    if (msg.intent == "render") {
        x = msg.x;
        y = msg.y;
        palette = msg.palette;
        if(!rendering){
            postMessage({
                intent: "clear"
            })
            rendering = true;
            render();   
        }
    }
}

function mapImaginary(im) {
    return (im + (y / 2)) / (y) * (windowYMax - windowYMin) + windowYMin;
}

function mapReal(re) {
    return (re + (x / 2)) / (x) * (windowXMax - windowXMin) + windowXMin;
}

function complexSquare(c) {
    let re = -(c.im * c.im) + (c.re * c.re);
    let im = 2 * (c.re * c.im);

    return {
        im: im,
        re: re
    };
}

function complexAdd(a, b) {
    return {
        im: a.im + b.im,
        re: a.re + b.re
    };
}

function magnitude(c) {
    // We skip the square root here for speed
    return Math.abs(Math.pow(c.im, 2) + Math.pow(c.re, 2));
}

function checkPoint(c, z, iter) {
    if (iter == maxIter)
        return iter;
    if (magnitude(z) > 4)
        return iter;

    return checkPoint(c, complexAdd(complexSquare(z), c), ++iter);
}

function render() {
    for (let im = -(y / 2); im <= (y / 2); im++) {
        for (let re = -(x / 2); re <= (x / 2); re++) {
            let value = checkPoint({
                im: mapImaginary(im),
                re: mapReal(re)
            }, {
                im: 0,
                re: 0
            }, 0);
            let color = palette[value % 255];
            if (value == maxIter)
                color.r = color.g = color.b = 0;
            postMessage({
                intent: "pixel",
                color: color,
                x: re + (x / 2),
                y: im + (y / 2)
            });
        }
    }
    rendering = false;
}