import { Link as HomeLink } from "react-router-dom";
import { CATEGORIES } from "../utils/data";

function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-400 to-orange-600 text-white overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-32 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Welcome to ShopHub
                    </h1>
                    <p className="text-xl text-orange-50 mb-10 font-light">
                        Discover amazing electronics at unbeatable prices
                    </p>
                    <div>
                        <HomeLink to="/products" className="inline-block bg-white text-orange-500 font-semibold px-8 py-3 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                            Shop Now
                        </HomeLink>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Shop by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, idx) => (
                        <div key={idx} className={`${cat.bgColor} rounded-xl p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1`}>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <div className={`icon-${cat.icon} w-8 h-8 text-orange-500`}></div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                            <p className="text-gray-500 mb-8 text-sm">{cat.description}</p>
                            <HomeLink 
                                to={`/products?category=${cat.name}`} 
                                className="bg-orange-400 hover:bg-orange-500 text-white font-medium px-8 py-2.5 rounded-md transition-colors w-full max-w-[160px]"
                            >
                                Explore
                            </HomeLink>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;