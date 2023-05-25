#ifndef MEERKAT_H_
#define MEERKAT_H_

#include <string>

using std::string;

class MaverickMeerkat {
public:
    MaverickMeerkat(string const & name_, int age_);

    string name() const;

    int age() const;

    // sounds that meerkat produces
    string howl() const;

private:
    string name_;
    int age_;
};

#endif /* MEERKAT_H_ */
