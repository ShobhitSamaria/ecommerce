import { useSearchParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { formatPrice } from "../utils/currency";

function Products() {
    const { products } = useData();
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get("category");
    const CATEGORIES = [
        { name: "Mobile Phones" },
        { name: "Laptops" },
        { name: "Tablets" }
    ];

    const filteredProducts = categoryFilter
        ? products.filter(p => p.category === categoryFilter)
        : products;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12"> {/*  reduced top space */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start"> {/* fixed width layout */}

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {categoryFilter ? categoryFilter : 'All Products'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Showing {filteredProducts.length} results
                    </p>
                </div>

                {/* Simple Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:justify-end"> {/*  right align fixed */}
                    <Link
                        to="/products"
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'}`}
                    >
                        All
                    </Link>
                    {CATEGORIES.map(cat => (
                        <Link
                            key={cat.name}
                            to={`/products?category=${cat.name}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat.name ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts?.map(product => (
                    <div key={product.id} className="card group flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 overflow-hidden"> {/*  fixed image ratio */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">
                                {product.category}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-2">
                                {product.name}
                            </h3>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                                <Link
                                    to={`/product/${product.id}`}
                                    className="btn btn-outline py-1.5 px-3 text-sm rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="icon-search w-12 h-12 text-gray-300 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                    <p className="text-gray-500">Try selecting a different category.</p>
                </div>
            )}
        </div>
    );
}

export default Products;