#include "Rational.h"

#include <cassert>
#include <cstdlib>
#include <iostream>

// НОД
int gcd(int n, int m)
{
    assert(n >= 0 && m >= 0);
    if (n < m)
        return gcd(m, n);
    if (m == 0)
        return n;
    return gcd(m, n % m);
}

void Rational::normalize()
{
    int gcd_ = gcd(abs(num), den);
    num /= gcd_;
    den /= gcd_;
}

// Конструктор #2
Rational::Rational(int num_, int den_): num(num_), den(den_)
{
    assert(den > 0);
    normalize();
}

// Конструктор #3
Rational::Rational(int num_): num(num_), den(1) {}

// Операция вывода в поток: реализация.
ostream & operator<<(ostream & os, Rational const & r) 
{
    os << r.num;
    if (r.num != 0 && r.den != 1)
        os << " / " << r.den;
    return os;
}

// Операция умножения дробей: реализация.
Rational operator*(Rational const & lhs, Rational const & rhs)
{
    Rational res(lhs);
    res *= rhs;
    return res;
}

Rational & Rational::operator*=(Rational const & other)
{
    num *= other.num;
    den *= other.den;
    normalize();
    return *this;
}

// Операция сложения дробей: реализация.
Rational operator+(Rational const & lhs, Rational const & rhs)
{
    Rational res(lhs);
    res += rhs;
    return res;
}

Rational & Rational::operator+=(Rational const & other)
{
    int lcm = den * other.den / gcd(den, other.den);
    num = num * (lcm / den) + other.num * (lcm / other.den);
    den = lcm;
    normalize();
    return *this;
}

