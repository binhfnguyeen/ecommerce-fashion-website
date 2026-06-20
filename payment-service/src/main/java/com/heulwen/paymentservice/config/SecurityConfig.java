package com.heulwen.paymentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Cho phép gọi các API nội bộ từ các microservice khác
                        .requestMatchers("/api/internal/orders/**").permitAll()
                        // API Thống kê doanh thu và biểu đồ của Admin
                        .requestMatchers("/api/orders/statistics/**").hasRole("ADMIN")
                        // GET xem tất cả đơn hàng (Admin quản lý)
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                        // PUT cập nhật trạng thái đơn hàng (Admin quản lý)
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("ADMIN")
                        // Các API còn lại của đơn hàng yêu cầu đã đăng nhập (USER hoặc ADMIN)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new GatewayHeaderFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
