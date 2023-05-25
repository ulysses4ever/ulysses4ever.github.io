// 
// File:   main.cc
// Author: ulysses
//
// Created on 4 Май 2008 г., 0:01
//
#include <cstdlib>
#include <iostream>
#include <boost/asio.hpp>

using boost::asio::ip::tcp;
using namespace std;

#define FAIL

struct Bar {
    Bar(io_service& ioService) {
#ifdef FAIL
        tcp::resolver resolver(io_service);
        tcp::resolver::query query(tcp::v4(), "127.0.0.1", "1560");
        tcp::resolver::iterator iterator = resolver.resolve(query);
#endif
    }
};

int main(int argc, char** argv) {
    boost::asio::io_service io_service;

//are compiled without errors:
    tcp::resolver resolver(io_service);
    tcp::resolver::query query(tcp::v4(), "127.0.0.1", "1560");
    tcp::resolver::iterator iterator = resolver.resolve(query);

    io_service.run();
    
    return (EXIT_SUCCESS);
}

