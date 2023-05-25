#include <iostream>
#include <stdexcept>

using std::cout;
using std::cin;
using std::endl;

enum DayOfWeek {MON = 1, TUE, WED, THU, FRI, SAT, SUN};

/*
    Prints given `dayOfWeek` to the standard output
*/
void print_day_of_week(DayOfWeek dow)
{
    // TODO: your implementation with HUGE SWITCH goes here...
    // HINT: if dow is MON print "Monday", etc.
}

/*
    Reads number (from 1 to 7) and returns corresponding DayOfWeek value
*/
DayOfWeek read_day_of_week()
{
    int day;
    cin >> day;
    if ( 1 /* TODO: replace 1 with error check */ ) {
        throw std::range_error("number of day should be in a range [1, 7]");
    }
    return static_cast<DayOfWeek>(day); // NOTE: explicit cast: int -> DayOfWeek
    // HINT: "explicit cast" means: 
    //       "I wanna change type of the given expression to this"
    // In this case we change the type of `day` (which is int) to DayOfWeek.
    // Q: what would happen if you wirte just:
    // return day;
}


int main()
{
    // ask user to input current day of week 
    
    DayOfWeek dow /* TODO: initialize with read_day_of_week */;
    
    // TODO: call print_day_of_week for dow    
}

