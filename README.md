# Image Manipulation using WebAssembly and C

## Introduction
This repository is a demonstration how we can export a C program to WebAssembly using Emscripten.

## Getting Started
Clone this repository using Codespace.
```
$ git clone https://github.com/ebaskoro/image-manipulation-wasm-c
```

Change directory to the `public` folder and run a local HTTP server.
```
$ cd public
$ python3 -m http.server
```

Open a browser and browse to `http://localhost:8000`

## Walkthrough
Create a folder structure as below:
```
.
├── src
└── public
    ├── app
    └── img
```

Create `processor.c` file and place it under the `src` folder.

Let's create the first function to adjust the RGBA channels of an image:
```C
#include <stdint.h>
#include <stdlib.h>
#include <emscripten.h>


EMSCRIPTEN_KEEPALIVE void Adjust(uint8_t *input, int length, float r_adjustment, float g_adjustment, float b_adjustment, float a_adjustment)
{
	for (int i = 0; i < length; i += 4)
	{
		int r = input[i];
		int new_r = r * r_adjustment;
		input[i] = (new_r > 255) ? 255 : ((new_r < 0) ? 0 : new_r);
		
		int g = input[i+1];
		int new_g = g * g_adjustment;
		input[i+1] = (new_g > 255) ? 255 : ((new_g < 0) ? 0 : new_g);
		
		int b = input[i+2];
		int new_b = b * b_adjustment;
		input[i+2] = (new_b > 255) ? 255 : ((new_b < 0) ? 0 : new_b);
		
		int a = input[i+3];
		int new_a = a * (1 - a_adjustment);
		input[i+3] = (new_a > 255) ? 255 : ((new_a < 0) ? 0 : new_a);
	}
}
```
Here we use the standard integer and library headers. We also include the emsripten header to export the `EMSCRIPTEN_KEEPALIVE` macro. This is required to export the aforementioned function to WebAssembly.

Next we define the _Sephia_ filter:
```C
EMSCRIPTEN_KEEPALIVE void Sephia(uint8_t *input, int length)
{
	for (int i = 0; i < length; i += 4)
	{
		int r = input[i];
		int g = input[i+1];
		int b = input[i+2];

		int y = (r * 0.3) + (g * 0.59) + (b * 0.11);
		
		input[i] = y;
		input[i+1] = y;
		input[i+2] = y;
	}
}
```

Next we define the _gray scale_ filter:
```C
EMSCRIPTEN_KEEPALIVE void GrayScale(uint8_t *input, int length)
{
	for (int i = 0; i < length; i += 4)
	{
		int r = input[i];
		int g = input[i+1];
		int b = input[i+2];
		int a = input[i+3];

		input[i] = r;
		input[i+1] = r;
		input[i+2] = r;
		input[i+3] = a;
	}
}
```

Next we define the _invert_ filter:
```C
EMSCRIPTEN_KEEPALIVE void Invert(uint8_t *input, int length)
{
	for (int i = 0; i < length; i += 4)
	{
		int r = input[i];
		int g = input[i+1];
		int b = input[i+2];
		int a = input[i+3];

		input[i] = 255 - r;
		input[i+1] = 255 - g;
		input[i+2] = 255 - b;
	}
}
```

Next we define the _noise_ filter:
```C
EMSCRIPTEN_KEEPALIVE void Noise(uint8_t *input, int length)
{
	int random;

	for (int i = 0; i < length; i += 4)
	{
		int r = input[i];
		int g = input[i+1];
		int b = input[i+2];
		int a = input[i+3];

		random = (rand() % 70) - 35;

		input[i] = r + random;
		input[i+1] = g + random;
		input[i+2] = b + random;
	}
}
```

To compile the C file and export its functions:
```Bash
$ emcc src/processor.c -o public/app/processor.js -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_malloc', '_free']"
```

This will create the `processor.js` and `processor.wasm` under the `public/app` folder. The folder structure is now as shown below:
```
.
├── src
|   └── processor.c
└── public
    ├── app
    |   ├── processor.js
    |   └── processor.wasm
    └── img
```

Copy [image.jpg](./public/img/image.jpg) to the `img` folder.

Copy [index.html](./public/index.html) to the `public` folder.

Copy [app.js](./public/app/app.js) to the `public/app` folder.