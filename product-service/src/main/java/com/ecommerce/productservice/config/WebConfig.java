package com.ecommerce.productservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = System.getProperty("user.dir") + "/product-service/uploads/";
        // This exposes the 'uploads' folder so React can access images via URL
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:"+uploadPath);
    }
}