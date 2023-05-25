#ifndef DATES_H
#define DATES_H

/*
    ������ ���� ������: 0 - �����������, 1 - ����������� � �.�.
    ������ �������: 1 - ������, 2 - ������� � �.�.

    ��� ������� ����� �������� ����-������������, ��������:
    enum DaysOfWeek {Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, 
                        Saturday}; // Sunday == 0, Monday == 1, etc.
    enum Months {January = 1, Fabruary, March, April, May, June, July, August,
                    September, October, November, December};
                    // January == 1, Fabruary == 2, March == 3, etc.
*/

// ���������� �������� �������� ���� ��� year �������� ����������
bool isLeapYear(int year);

// ���������� ���������� ���� � ������ month ���� year
int monthDays(int month, int year);

// ���������� �������� ��������, ���� ���� �������� ����������
bool isCorrectDate(int day, int month, int year);

// ���������� ���������� ����
void prevDate(int& day, int& month, int& year);

// ���������� ��������� ����
void nextDate(int& day, int& month, int& year);

/*
���������� ���� ������, ��������������� ���������� ����, �� ���������� ���������:
	a = (14 - �����) / 12
	y = ��� - a
	m = ����� + 12 * a - 2
	���������� = (7000 + (���� + y + y / 4 - y / 100 + y / 400 + (31 * m) / 12)) ������� 7

��� ������� ������������� (������� �������������). ���������: 0 � �����������, 
1 � ����������� � �. �.
*/
int dayOfWeek(int day, int month, int year);

#endif // DATES_H
