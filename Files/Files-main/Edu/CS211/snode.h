#ifndef SNODE_H
#define SNODE_H

#include <iostream>

/* `node` for singly-linked list of T's */
template<typename T>
struct node {
    T      data;
    node * next; 
    
    node(T const & data, node * next = nullptr): 
        data(data), next(next) 
        {}
};

/* print list in forward order */
template<typename T>
void print_nodes(node<T> * head)
{
    while (head)
    {
        std::cout << head->data << " -> ";
        head = head->next;
    }
    std::cout << "|" << std::endl;
}

/* free memory for all nodes in a list */
template<typename T>
void purge_nodes(node<T> * head)
{
    while (head)
    {
        node<T> * p = head->next;
        delete head;
        head = p;
    }
}

/* SNODE_H */
#endif 

