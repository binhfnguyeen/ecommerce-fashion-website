package com.heulwen.apigateway.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
@Order(101)
@Slf4j
public class AuthenticationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getSubject();
            String role = jwt.getClaimAsString("role");
            String email = jwt.getClaimAsString("email");

            Object userIdObj = jwt.getClaim("userId");
            String userId = userIdObj != null ? userIdObj.toString() : "";
            log.info("Propagating user headers: id={}, username={}, role={}", userId, username, role);

            HeaderMapRequestWrapper requestWrapper = new HeaderMapRequestWrapper(httpRequest);
            requestWrapper.addHeader("X-User-Id", userId);
            requestWrapper.addHeader("X-User-Username", username);
            requestWrapper.addHeader("X-User-Role", role);
            requestWrapper.addHeader("X-User-Email", email);
            chain.doFilter(requestWrapper, response);
        } else {
            chain.doFilter(request, response);
        }
    }

    private static class HeaderMapRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> headerMap = new HashMap<>();

        public HeaderMapRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        public void addHeader(String name, String value) {
            headerMap.put(name, value);
        }

        @Override
        public String getHeader(String name) {
            if (headerMap.containsKey(name)) {
                return headerMap.get(name);
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            for (String name: headerMap.keySet()) {
                if (!names.contains(name)) {
                    names.add(name);
                }
            }
            return Collections.enumeration(names);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (headerMap.containsKey(name)) {
                return Collections.enumeration(Collections.singletonList(headerMap.get(name)));
            }
            return super.getHeaders(name);
        }
    }
}
