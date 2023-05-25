#ifndef RSA_KEYS_H
#define RSA_KEYS_H

#include <NTL/ZZ.h>

using NTL::ZZ;

struct PubKey {
    ZZ e, n;
};

struct PrivateKey {
    ZZ d, n;
};

struct RsaParams {
    PubKey pub;
    PrivateKey priv;
};

#endif
