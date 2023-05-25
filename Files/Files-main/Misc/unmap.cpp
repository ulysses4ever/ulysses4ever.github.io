#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

#include <cstdlib>

template<typename T, typename Cont>
std::vector<int> unmap(T * map, size_t map_size, Cont const & points) {
	std::vector<int> result;
	result.reserve(points.size());
	for (Cont::const_iterator it = points.begin(); it != points.end(); ++it) {
		result.push_back(std::find(map, map + map_size, *it) - map);
	}
	return result;
}

template<typename T>
class unmap_each {
	T* map;
	size_t map_size;
	
public:
	unmap_each(T* map, size_t map_size) : map(map), map_size(map_size) {}

	template<typename Cont>
	std::vector<int> operator()(Cont const & c) {
		return unmap(map, map_size, c);
	}
};

int main() {
	int map[] = {10, 20, 30};
	int points_arr[] = {20, 10, 10, 10, 30};
	std::vector<int> points(points_arr, points_arr + 5);
	std::vector<int> umap = unmap(map, 3, points);
	
	using namespace std;
	copy(umap.begin(), umap.end(), ostream_iterator<int>(cout, " "));

}