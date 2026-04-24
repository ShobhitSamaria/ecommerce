import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useData } from "../context/DataContext";
import { formatPrice } from "../utils/currency";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuth();
    const { addToCart } = useCart();
    const { products } = useData();

    const product = products.find((p) => p.id === Number(id));

    if (!product) {
        return (
            <div className="text-center py-20 text-xl font-semibold">
                Product not found
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!user) {
            navigate("/login", { state: { from: location } });
            return;
        }

        addToCart(product);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="bg-gray-50 p-8 md:p-12 flex items-center justify-center">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                        />
                    </div>

                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide rounded-full mb-4 w-fit">
                            {product.category}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline mb-6">
                            <span className="text-3xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                            </span>
                            <span className="ml-3 text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                In Stock
                            </span>
                        </div>

                        <div className="prose prose-sm text-gray-600 mb-8">
                            <p>{product.description}</p>
                            <ul className="list-disc pl-5 mt-4 space-y-1">
                                <li>Genuine product with manufacturer warranty</li>
                                <li>7-day replacement policy</li>
                                <li>Free delivery available</li>
                            </ul>
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 btn btn-primary py-3 text-lg rounded-xl shadow-lg shadow-orange-200"
                            >
                                <div className="icon-shopping-cart w-5 h-5 mr-2"></div>
                                Add to Cart
                            </button>
                            <button className="btn btn-outline py-3 px-4 rounded-xl">
                                <div className="icon-heart w-5 h-5"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
