/*
 * main.cpp
 *
 *  Created on: 05.12.2010
 *      Author: Artem M. Pelenitsyn
 */

#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <map>

//#include <boost/

//#include <boost/static_assert.hpp>
//#include <boost/type_traits/is_same.hpp>
//
//#include <boost/mpl/vector.hpp>
//#include <boost/mpl/assert.hpp>
//
//#include "print_types.hpp"
//#include "task5.hpp"
//#include "task6.hpp"

using namespace std;

class Animal {
public:
	virtual string say() const = 0;

	virtual Animal * clone() const = 0;

	virtual ~Animal() {}

	friend class PrototypedAnimalCreator;
};

class Cow : public Animal {
public:
	string say() const {
		return "Му-у-у";
	}

	Animal * clone() const {
		return new Cow(*this);
	}

	~Cow() {
		cout << "Бедная корова, я знал её, Горацио..." << endl;
	}
};

class Zoo {
	vector<Animal *> animals;

public:
	void addAnimal(Animal const & a) {
		animals.push_back(a.clone());
	}

	Zoo() {}

	Zoo(Zoo const & z) {
		animals.reserve(z.animals.size());
		for(int i = 0; i < animals.size(); ++i) {
			animals.push_back(z.animals[i]->clone());
		}
	}

	void walk() {
		for(int i = 0; i < animals.size(); ++i) {
			cout << animals[i]->say() << endl;
		}
	}

	~Zoo() {
		for(size_t i = 0; i < animals.size(); ++i) {
			delete animals[i];
		}
	}

private:
	Zoo & operator=(Zoo const &);
};

class AnimalCreator {
public:
	virtual Animal * generate(string spec, string name, int age) = 0;
	virtual ~AnimalCreator() {}
};

class SimpleAnimalCreator : public AnimalCreator {
public:
	virtual Animal * generate(string spec, string name, int age) {
		if(spec == "cow")
			return new Cow;
		else
			return 0;
	}

	virtual ~SimpleAnimalCreator() {}
};

class ZooCreator {
public:
	virtual Zoo create() = 0;

	virtual ~ZooCreator() {}
};

class StreamZooCreator {
	istream & is;
	AnimalCreator * ac;
public:
	StreamZooCreator(istream & is, AnimalCreator * ac) :
			is(is), ac(ac) {}

	Zoo create() {
		Zoo zoo;
		while(true) {
			string line, spec, name;
			int age;
			is >> spec;
			is >> name;
			is >> age;
			if (!is)
				break;
			Animal * an(ac->generate(spec, name, age));
			zoo.addAnimal(*an);
			delete an;
			//getline(is, line);
		}
		return zoo;
	}
};

int main() {
	map<string, Animal *> mp;
	mp["cow"] = new Cow;
	mp["dog"] = new Cow;
	cout << mp["cow"]->say() << endl;
//	istringstream iss("cow mumka 1\ncow zorka 2");
//	SimpleAnimalCreator sac;
//	StreamZooCreator zc(iss, &sac);
//	Zoo z = zc.create();
//
//	Zoo z1, z2;
	//z1 = z2;

//	z.walk();
//	Animal const & a1 = Cow();
//	Cow cow;
//	Animal & a2(cow);
//	cout << a1.say() << endl;
//
//	Zoo z;
//	z.addAnimal(cow);
//	z.addAnimal(cow);
//    using std::cout;
//    using std::endl;
//
//    // task 5
//    typedef task5::inherit_pairs<task5::types_f>::type complex_type;
//    complex_type ct;
//    static_cast <task5::wrap <int, char> &> (ct).f(1, 'a');
//    static_cast <task5::wrap <char, int> &> (ct).f('a', 1);
//
//    // should not compile and does not:
//    // static_cast <task5::wrap <int, int> &>(ct).f( 1, 42);
//
//    typedef task6::inherit_pairs<mpl::vector <char, short, int> >::type complex_type_2;
//    // ~ struct complex_type : wrap <char, short>, wrap <char, int>, wrap <short, int> {};
//    complex_type_2 ct2;
//    static_cast<task6::wrap <char, int> &>(ct2).f('a', 1);
//    static_cast<task6::wrap <char, short> &>(ct2).f('a', static_cast<short>(1));
//    static_cast<task6::wrap <short, int> &>(ct2).f(static_cast<short>(1), 1);
//
//    // should not compile and does not:
////     static_cast <task6::wrap <int, int> &> (ct2).f( 1, 42);
////     static_cast <task6::wrap <int, short> &> (ct2).f( 1, 42);
}
