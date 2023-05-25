#include <ctime>
#include <string>
#include "Meerkat.h"

using std::string;

MaverickMeerkat::MaverickMeerkat(string const & name_, int age_) :
        name_(name_), age_(age_) {}

string MaverickMeerkat::name() const {
    return "Maverick " + name_;
}

int MaverickMeerkat::age() const {
    return age_;
}

string MaverickMeerkat::howl() const {
    std::time_t now_t = std::time(0);
    std::tm * now = std::localtime(&now_t);
    if (0 <= now->tm_hour && now->tm_hour <= 8)
        return "Wouuu... *sleepy*";
    else
        return "Yaaa... *cheerful*";
}

