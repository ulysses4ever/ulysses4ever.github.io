#include <iostream>

using std::cout;
using std::cin;
using std::endl;

void set_zero(int* pa)
{
	*pa = 0;
}

void set_zero_wrong(int* pa)
{
	pa = 0;
}

int main()
{
	int a = 0;

	// ��������� ������ ���������� � ���������� ����� ������ � addr_a
	int * addr_a = &a;

	cout << "Address of a is: " << addr_a << endl;

	// ������������� ��������� (��������� � ������ ��������)
	*addr_a = 5;
	cout << "Value of a is: " << *addr_a << endl;
	
	// �������� ��������� � ������� �� ���������
	set_zero(&a);
	cout << "Value of a is: " << a << endl;

	// ��� ��������� ���������� �� ��������, ������� �� �� ��������
	set_zero_wrong(addr_a);
	cout << "Address of a is: " << addr_a << endl;

	const int SIZE = 5; // ����� ������������ ������� ������ ���� ����������
	int arr[SIZE] = {1, 2, 3, 4, 5}; // ����������� �������������� ������� arr
	
	// ��������� � ��������� ������� � ������� ���������
	int * p = arr; // ��� ������� ~ ����� ������� ��������
	cout << "arr[0] = " << *p << endl;
	cout << "arr[4] = " << *(p+4) << endl; // ���������� ����������

	++p; // ������ p ��������� �� ������ ������� �������, � �� �� ������ ����
	     // � ������ �������
	cout << "arr[1] = " << *p << endl;
	++p; // � ������ �� ������
	cout << "arr[2] = " << *p << endl;
}

