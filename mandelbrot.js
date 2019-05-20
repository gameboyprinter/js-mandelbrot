// Start and end colors for gradient
let start = {
    r: 0x9f,
    g: 0xf9,
    b: 0xbe
};
let end = {
    r: 0x51,
    g: 0x87,
    b: 0xc5
}

// Resolution of the final image
const x = 640;
const y = 480;

let ctx, canvas;
let palette = new Array(256);
let worker;

function load() {
    generateColors();
    canvas = document.getElementById("canvas");
    canvas.height = y;
    canvas.width = x;
    ctx = canvas.getContext("2d");
    worker = new Worker("mandelbrotworker.js");

    worker.postMessage({
        intent: "render",
        x: x,
        y: y,
        palette: palette
    });

    worker.onmessage = (e) => {
        let msg = e.data;
        if (msg.intent == "pixel") {
            let color = msg.color;
            let pixelX = msg.x;
            let pixelY = msg.y
            ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},1)`;
            ctx.fillRect(pixelX, pixelY, 1, 1);
        } else if(msg.intent = "clear") {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, x, y);
        }
    }
}

function render() {
    worker.postMessage({
        intent: "render",
        x: x,
        y: y,
        palette: palette
    });
}

function generateColors() {
    for (let i = 0; i < 256; i++) {
        palette[i] = {
            r: start.r * (i / 255) + end.r * (1 - (i / 255)),
            g: start.g * (i / 255) + end.g * (1 - (i / 255)),
            b: start.b * (i / 255) + end.b * (1 - (i / 255))
        };
    }
}