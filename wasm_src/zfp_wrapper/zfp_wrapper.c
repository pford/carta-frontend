#include <stdio.h>
#include <emscripten/emscripten.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include "zfp.h"

int main(int argc, char** argv) {
    printf("Loaded ZFP wrapper\n");
}

int EMSCRIPTEN_KEEPALIVE encodeFloats(float* arr, char* rgba, int N) {
    uint32_t* u32arr = (uint32_t*) arr;
    for (int i = 0, offset = 0; i < N; i++, offset += 4) {
        unsigned int xi = u32arr[i];
        int v = (xi >> 31 & 1) | ((xi & 0x7fffff) << 1);
        rgba[offset] = v / 0x10000;
        rgba[offset + 1] = (v % 0x10000) / 0x100;
        rgba[offset + 2] = v % 0x100;
        rgba[offset + 3] = xi >> 23 & 0xff;
    }
    return 0;
}

int EMSCRIPTEN_KEEPALIVE zfpDecompress(int precision, float* array, int nx, int ny, unsigned char* buffer, int compressedSize) {
    int status = 0;    /* return value: 0 = success */
    zfp_type type;     /* array scalar type */
    zfp_field* field;  /* array meta data */
    zfp_stream* zfp;   /* compressed stream */
    bitstream* stream; /* bit stream to write to or read from */
    type = zfp_type_float;
    field = zfp_field_2d(array, type, nx, ny);
    zfp = zfp_stream_open(NULL);

    zfp_stream_set_precision(zfp, precision);
    stream = stream_open(buffer, compressedSize);
    zfp_stream_set_bit_stream(zfp, stream);
    zfp_stream_rewind(zfp);

    if (!zfp_decompress(zfp, field)) {
        printf("Decompression failed!\n");
        status = 1;
    }

    zfp_field_free(field);
    zfp_stream_close(zfp);
    stream_close(stream);

    return status;
}