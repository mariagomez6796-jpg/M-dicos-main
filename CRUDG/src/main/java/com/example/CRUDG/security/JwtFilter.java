package com.example.CRUDG.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;



@Component

public class JwtFilter extends OncePerRequestFilter {

     @Autowired
    private JwtUtil jwtUtil;

    /**
     * Override shouldNotFilter to completely skip JWT validation for public routes.
     * This is the Spring-recommended approach to exclude specific paths from a filter.
     *
     * @param request The HTTP request
     * @return true if the filter should NOT be applied to this request
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        
        // Skip JWT validation for public authentication and registration endpoints
        return path.startsWith("/api/v1/auth/") ||
               path.equals("/api/v1/admin") ||
               path.startsWith("/api/v1/admin/") ||
               path.equals("/api/v1/patients/register") ||
               path.startsWith("/api/v1/blockchain/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
                String path = request.getServletPath();

    // 🚫 Ignorar rutas públicas
    if (path.startsWith("/api/v1/auth/")
        || path.startsWith("/api/v1/patient/")
        || path.startsWith("/api/v1/patients/")
        || path.startsWith("/api/v1/doctor/")
        || path.startsWith("/api/v1/doctors/")
        || path.startsWith("/api/v1/admin/")
        || path.startsWith("/api/v1/medical-history/")
        || path.startsWith("/api/v1/vital-signs/")
        || path.startsWith("/api/v1/allergies/")
        || path.startsWith("/api/v1/conditions/")) {

        filterChain.doFilter(request, response);
        return;
    }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.isTokenValid(token)) {
                Claims claims = jwtUtil.extractAllClaims(token);
                request.setAttribute("claims", claims);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                response.setContentType("application/json");
                return;
            }
        } else {
            // If no Authorization header is present on a protected route, return 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authorization header required\"}");
            response.setContentType("application/json");
            return;
        }

        filterChain.doFilter(request, response);
    }
    
}
