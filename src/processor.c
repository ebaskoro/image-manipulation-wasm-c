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