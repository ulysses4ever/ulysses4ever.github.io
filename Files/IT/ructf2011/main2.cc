struct j {
};
struct z {
    enum {
        l = sizeof(int)
    };
};
struct k {
    enum {
        x = sizeof(int) / sizeof(int)
    };
};
template<typename q> struct v {
    enum {
        z = q::x - q::x
    };
};
template<typename d> struct i {
    enum {
        b = d::l * (d::l + sizeof(int))
    };
};
template<typename a, typename b> struct g {
    typedef a h;
    typedef b i;
};
template<int y> struct f {
    typedef f<y> k;
    enum {
        l = y
    };
};
template<int x, template<int> class z> struct c {
    typedef g<typename z<x>::k, typename c<x - k::x, z>::d> d;
};
template<template<int> class q> struct c<v<k>::z, q> {
    typedef g<q<v<k>::z> , j> d;
};
template<int w, typename g> struct m {
    typedef typename m<w - k::x, typename g::i>::n n;
};
template<typename h> struct m<v<k>::z, h> {
    typedef typename h::h n;
};
template<int c, typename u> struct o {
    typedef g<typename u::h, typename o<c - k::x, typename u::i>::p> p;
};
template<typename e> struct o<v<k>::z, e> {
    typedef typename e::i p;
};
template<typename y> struct l {
    static void q() {
        l<typename y::i>::q();
    }
};
template<> struct l<j> {
    static void q() {
    }
};
template<int r, typename h, typename y> struct q {
    typedef g<typename h::h, typename q<r - k::x, typename h::i, y>::j> j;
};
template<typename f, typename m> struct q<v<k>::z, f, m> {
    typedef g<m, f> j;
};
template<int w, typename a, typename n> struct r {
    typedef a q;
};
template<typename n, typename a> struct r<v<k>::z, n, a> {
    typedef a q;
};
template<typename z> struct s {
    enum {
        w = k::x + s<typename z::i>::w
    };
};
template<> struct s<j> {
    enum {
        w = -k::x
    };
};
template<typename y, typename s> struct t {
    typedef typename m<v<k>::z, s>::n b;
    enum {
        w = (int) y::l < (int) b::l
    };
};
template<typename A> struct t<A, j> {
    enum {
        w = k::x
    };
};
template<typename u> struct y {
    enum {
        z = t<typename u::h, typename u::i>::w && y<typename u::i>::z
    };
};
template<> struct y<j> {
    enum {
        z = k::x
    };
};
template<typename e, typename u> struct w {
    typedef typename r<((int) e::l > (int) m<v<k>::z, u>::n::l), g<typename m<
            v<k>::z, u>::n, g<e, typename o<v<k>::z, u>::p> > , g<e, g<
            typename m<v<k>::z, u>::n, typename o<v<k>::z, u>::p> > >::q s;
};
template<typename p> struct w<p, j> {
    typedef g<p, j> s;
};
template<typename g> struct x {
    typedef typename w<typename g::h, typename x<typename g::i>::k>::s k;
};
template<> struct x<j> {
    typedef j k;
};
template<int s, typename l> struct a {
    typedef typename a<y<typename x<l>::k>::z, typename x<l>::k>::f f;
};
template<typename l> struct a<k::x, l> {
    typedef l f;
};
template<typename i> struct b {
    typedef typename a<y<i>::z, i>::f e;
};
int main() {
    l<b<c<i<f<i<f<i<z>::b> >::b> >::b, f>::d>::e>::q();
}

