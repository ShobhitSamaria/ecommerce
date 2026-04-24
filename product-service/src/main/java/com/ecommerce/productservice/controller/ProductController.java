package com.ecommerce.productservice.controller;

import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Directory to save images
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/product-service/uploads/";

    // 1. Create Product with Image
    @PostMapping("/add")
    public Product addProduct(@RequestParam("name") String name,
                              @RequestParam("category") String category,
                              @RequestParam("price") Double price,
                              @RequestParam("stockUnit") Integer stockUnit,
                              @RequestParam("description") String description,
                              @RequestParam("image") MultipartFile image) throws IOException {

        // Handle Image Upload
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(image.getInputStream(), filePath);

        // Save Product Details
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockUnit(stockUnit);
        product.setDescription(description);
        product.setProductImage(fileName); // Saving file name

        return productRepository.save(product);
    }

    // 2. View All Products
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 3. Delete Product
    @DeleteMapping("/delete/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return "Product deleted successfully!";
    }

    // 4. Update Product (Simple version)
    @PutMapping("/update/{id}")
    public Product updateProduct(@PathVariable Long id,
                                 @RequestParam("name") String name,
                                 @RequestParam("category") String category,
                                 @RequestParam("price") Double price,
                                 @RequestParam("stockUnit") Integer stockUnit,
                                 @RequestParam("description") String description,
                                 @RequestParam(value = "image", required = false) MultipartFile image) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockUnit(stockUnit);
        product.setDescription(description);

        if (image != null && !image.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName);
                Files.copy(image.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                product.setProductImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Could not store image. Please try again!");
            }
        }

        return productRepository.save(product);
    }}