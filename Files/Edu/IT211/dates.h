#ifndef DATES_H
#define DATES_H

/*
    Номера дней недели: 0 - воскресенье, 1 - понедельник и т.д.
    Номера месяцев: 1 - январь, 2 - февраль и т.д.

    При желании можно объявить типы-перечисления, например:
    enum DaysOfWeek {Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, 
                        Saturday}; // Sunday == 0, Monday == 1, etc.
    enum Months {January = 1, Fabruary, March, April, May, June, July, August,
                    September, October, November, December};
                    // January == 1, Fabruary == 2, March == 3, etc.
*/

// Возвращает истинное значение если год year является високосным
bool isLeapYear(int year);

// Возвращает количество дней в месяце month года year
int monthDays(int month, int year);

// Возвращает истинное значение, если дата является правильной
bool isCorrectDate(int day, int month, int year);

// Определяет предыдущую дату
void prevDate(int& day, int& month, int& year);

// Определяет следующую дату
void nextDate(int& day, int& month, int& year);

/*
Определяет день недели, соответствующий указаннной дате, по следующему алгоритму:
	a = (14 - месяц) / 12
	y = год - a
	m = месяц + 12 * a - 2
	ДеньНедели = (7000 + (день + y + y / 4 - y / 100 + y / 400 + (31 * m) / 12)) ОСТАТОК 7

Все деления целочисленные (остаток отбрасывается). Результат: 0 — воскресенье, 
1 — понедельник и т. д.
*/
int dayOfWeek(int day, int month, int year);

#endif // DATES_H
