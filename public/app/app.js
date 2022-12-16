class PageObject {

    constructor() {
        this.canvases = document.getElementById("canvases");
        this.originals = document.querySelectorAll('[x-id="original"]');
        this.originalCanvas = document.getElementById('original');
        this.redAdjustmentSlider = document.querySelector('[x-id="redAdjustment"]');
        this.redAdjustmentTooltip = document.querySelector('output[for="redAdjustment"]');
        this.greenAdjustmentSlider = document.querySelector('[x-id="greenAdjustment"]');
        this.greenAdjustmentTooltip = document.querySelector('output[for="greenAdjustment"]');
        this.blueAdjustmentSlider = document.querySelector('[x-id="blueAdjustment"]');
        this.blueAdjustmentTooltip = document.querySelector('output[for="blueAdjustment"]');
        this.alphaAdjustmentSlider = document.querySelector('[x-id="alphaAdjustment"]');
        this.alphaAdjustmentTooltip = document.querySelector('output[for="alphaAdjustment"]');
        this.loader = document.getElementById('loader');
        this.download = document.getElementById('download');
    }


    showOriginalImages(imageBitmap) {
        this.originalImageBitmap = imageBitmap;

        const div = document.createElement("div");
        div.className = "tile is-2 is-clipped";
        this.canvases.appendChild(div);
        
        const canvas = document.createElement("canvas");
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        div.appendChild(canvas);

        const context = canvas.getContext("2d");
        context.drawImage(imageBitmap, 0, 0);

        this.originals.forEach(element => {
            const canvas = document.createElement("canvas");
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            element.appendChild(canvas);

            const context = canvas.getContext("2d");
            context.drawImage(imageBitmap, 0, 0);
        });

        this.originalImageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    }


    createCanvas(data) {
        const div = document.createElement("div");
        div.className = "tile is-2 is-clipped";
        this.canvases.appendChild(div);

        const canvas = document.createElement("canvas");
        canvas.width = this.originalImageBitmap.width;
        canvas.height = this.originalImageBitmap.height;
        div.appendChild(canvas);
        
        const context = canvas.getContext("2d");
        var imageData = context.createImageData(this.originalImageBitmap.width, this.originalImageBitmap.height);
        imageData.data.set(data);
        context.putImageData(imageData, 0, 0);
    }


    showImageSliders(slidersChangedHandler) {
        this.originalCanvas.width = this.originalImageData.width;
        this.originalCanvas.height = this.originalImageData.height;
        const context = this.originalCanvas.getContext('2d');
        var imageData = context.createImageData(this.originalImageData.width, this.originalImageData.height);
        imageData.data.set(this.originalImageData.data);
        context.putImageData(imageData, 0, 0)

        const updateImage = () =>
        {
            const rAdjustment = this.redAdjustmentSlider.value;
            this.redAdjustmentTooltip.textContent = rAdjustment;

            const gAdjustment = this.greenAdjustmentSlider.value;
            this.greenAdjustmentTooltip.textContent = gAdjustment;

            const bAdjustment = this.blueAdjustmentSlider.value;
            this.blueAdjustmentTooltip.textContent = bAdjustment;

            const aAdjustment = this.alphaAdjustmentSlider.value;
            this.alphaAdjustmentTooltip.textContent = aAdjustment;

            imageData.data.set(slidersChangedHandler(rAdjustment, gAdjustment, bAdjustment, aAdjustment));
            context.putImageData(imageData, 0, 0);
        }

        this.redAdjustmentSlider.addEventListener('input', updateImage);
        this.greenAdjustmentSlider.addEventListener('input', updateImage);
        this.blueAdjustmentSlider.addEventListener('input', updateImage);
        this.alphaAdjustmentSlider.addEventListener('input', updateImage);

        this.download.addEventListener('click', () => {
            this.download.href = this.originalCanvas.toDataURL();
        });
    }


    hideLoader() {
        this.loader.className = 'pageloader';
    }

}


class WasmApi {

    constructor(Module) {
        this.adjust = Module.cwrap('Adjust', '', ['number', 'number', 'number', 'number', 'number', 'number']);
        this.sephia = Module.cwrap('Sephia', '', ['number', 'number']);
        this.invert = Module.cwrap('Invert', '', ['number', 'number']);
        this.grayScale = Module.cwrap('GrayScale', '', [ 'number', 'number' ]);
        this.noise = Module.cwrap('Noise', '', [ 'number', 'number' ]);
    }

}


function applyFilter(imageData, filter) {
    const { length } = imageData.data;
    const memory = Module._malloc(length);
    Module.HEAPU8.set(imageData.data, memory);
    
    const args = [memory, length].concat(...Array.prototype.slice.call(arguments, 2));
    filter(...args);
    
    var newImageData = Module.HEAPU8.subarray(memory, memory + length);
    Module._free(memory);
    return newImageData;
}


class WasmApp {

    constructor(Module, pageObject, api) {
        Module.onRuntimeInitialized = () => this.initialiseApp();

        this.pageObject = pageObject;
        this.api = api;
    }


    async initialiseApp() {
        await this.loadImage('./img/image.jpg');
        this.pageObject.showOriginalImages(this.imageBitmap);
        const originalImageData = this.pageObject.originalImageData;
        this.pageObject.createCanvas(applyFilter(originalImageData, this.api.adjust, 0.5, 0.8, 1.1, 0.0));
        this.pageObject.createCanvas(applyFilter(originalImageData, this.api.sephia));
        this.pageObject.createCanvas(applyFilter(originalImageData, this.api.grayScale));
        this.pageObject.createCanvas(applyFilter(originalImageData, this.api.invert));
        this.pageObject.createCanvas(applyFilter(originalImageData, this.api.noise));
        this.pageObject.showImageSliders((rAdjustment, gAdjustment, bAdjustment, aAdjustment) => applyFilter(originalImageData, this.api.adjust, rAdjustment, gAdjustment, bAdjustment, aAdjustment));
        this.pageObject.hideLoader();
    }


    async loadImage(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        this.imageBitmap = await createImageBitmap(blob);
    }

}


export {
    PageObject,
    WasmApi,
    WasmApp
};