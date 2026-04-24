package com.ecommerce.productservice.service;

import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProductController — CRUD operations with image upload.
 * 5 test cases covering add, view, delete, update scenarios.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private com.ecommerce.productservice.repository.ProductRepository productRepository;

    @InjectMocks
    private com.ecommerce.productservice.controller.ProductController productController;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("MacBook Pro 14\"");
        sampleProduct.setCategory("Electronics");
        sampleProduct.setPrice(1999.99);
        sampleProduct.setStockUnit(10);
        sampleProduct.setDescription("Apple MacBook Pro with M3 chip");
        sampleProduct.setProductImage("macbook.jpg");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-001: Get All Products
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-001: GET /api/products/all → returns list of all products")
    void testGetAllProducts_ReturnsProductList() {
        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("iPhone 15");
        product2.setCategory("Electronics");
        product2.setPrice(999.00);
        product2.setStockUnit(25);
        product2.setDescription("Apple iPhone 15");
        product2.setProductImage("iphone.jpg");

        when(productRepository.findAll()).thenReturn(Arrays.asList(sampleProduct, product2));

        List<Product> result = productController.getAllProducts();

        assertEquals(2, result.size());
        assertEquals("MacBook Pro 14\"", result.get(0).getName());
        assertEquals("iPhone 15", result.get(1).getName());
        verify(productRepository, times(1)).findAll();
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-002: Get All Products — Empty List
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-002: No products exist → returns empty list")
    void testGetAllProducts_EmptyList() {
        when(productRepository.findAll()).thenReturn(Arrays.asList());

        List<Product> result = productController.getAllProducts();

        assertTrue(result.isEmpty());
        assertEquals(0, result.size());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-003: Add Product with Image
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-003: Add product with image → product saved, image file stored")
    void testAddProduct_WithImage_Success() throws IOException {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "laptop.jpg",
                "image/jpeg",
                "fake image content".getBytes()
        );

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        Product result = productController.addProduct(
                "MacBook Pro 14\"",
                "Electronics",
                1999.99,
                10,
                "Apple MacBook Pro with M3 chip",
                image
        );

        assertNotNull(result);
        assertEquals("MacBook Pro 14\"", result.getName());
        assertEquals("Electronics", result.getCategory());
        assertEquals(1999.99, result.getPrice());
        assertEquals(10, result.getStockUnit());
        assertNotNull(result.getProductImage());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-004: Delete Product by ID
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-004: Delete existing product → product removed, success message")
    void testDeleteProduct_Exists_Success() {
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        String result = productController.deleteProduct(1L);

        assertEquals("Product deleted successfully!", result);
        verify(productRepository, times(1)).deleteById(1L);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TC-005: Update Product
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-005: Update existing product details → updated product returned")
    void testUpdateProduct_Exists_Success() {
        MockMultipartFile newImage = new MockMultipartFile(
                "image",
                "new_laptop.jpg",
                "image/jpeg",
                "new image content".getBytes()
        );

        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        Product result = productController.updateProduct(
                1L,
                "MacBook Pro 16\"",
                "Electronics",
                2199.99,
                5,
                "Updated: Apple MacBook Pro 16\" with M3 Pro chip",
                newImage
        );

        assertEquals("MacBook Pro 16\"", result.getName());
        assertEquals(2199.99, result.getPrice());
        assertEquals(5, result.getStockUnit());
        assertEquals("Updated: Apple MacBook Pro 16\" with M3 Pro chip", result.getDescription());
        verify(productRepository, times(1)).save(any(Product.class));
    }
}
