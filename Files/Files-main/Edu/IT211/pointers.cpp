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

	// Получение адреса переменной и сохранение этого адреса в addr_a
	int * addr_a = &a;

	cout << "Address of a is: " << addr_a << endl;

	// Разыменование указателя (установка и чтение значение)
	*addr_a = 5;
	cout << "Value of a is: " << *addr_a << endl;
	
	// Передача параметра в функцию по указателю
	set_zero(&a);
	cout << "Value of a is: " << a << endl;

	// Сам указатель передается по значению, поэтому он не меняется
	set_zero_wrong(addr_a);
	cout << "Address of a is: " << addr_a << endl;

	const int SIZE = 5; // длина статического массива должна быть константой
	int arr[SIZE] = {1, 2, 3, 4, 5}; // «агрегатная инициализация» массива arr
	
	// Обращение к элементам массива с помощью указателя
	int * p = arr; // Имя массива ~ адрес первого элемента
	cout << "arr[0] = " << *p << endl;
	cout << "arr[4] = " << *(p+4) << endl; // арифметика указателей

	++p; // Теперь p указывает на второй элемент массива, а не на второй байт
	     // с начала массива
	cout << "arr[1] = " << *p << endl;
	++p; // А теперь на третий
	cout << "arr[2] = " << *p << endl;
}

