#include "Rational.h"

#include <cassert>
#include <cstdlib>
#include <iostream>

// ���
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

// ����������� #2
Rational::Rational(int num_, int den_): num(num_), den(den_)
{
    assert(den > 0);
    normalize();
}

// ����������� #3
Rational::Rational(int num_): num(num_), den(1) {}

// �������� ������ � �����: ����������.
ostream & operator<<(ostream & os, Rational const & r) 
{
    os << r.num;
    if (r.num != 0 && r.den != 1)
        os << " / " << r.den;
    return os;
}

// �������� ��������� ������: ����������.
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

// �������� �������� ������: ����������.
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

