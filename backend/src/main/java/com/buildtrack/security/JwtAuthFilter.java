package com.buildtrack.security;

import com.buildtrack.model.User;
import com.buildtrack.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Equivalent of the Node backend's `protect` middleware: verifies the JWT on
 * every request and, if valid, loads the User and puts it on the security
 * context so controllers can read the caller via @AuthenticationPrincipal.
 *
 * If the token is missing or invalid, this filter does NOT reject the
 * request itself — it just leaves the request unauthenticated and records
 * why (see AUTH_ERROR_ATTRIBUTE), so that AuthEntryPoint can return the
 * same style of 401 message the Node API used ("Not authorised, no token" /
 * "Token invalid or expired") only for routes that actually require auth.
 * Public routes (register/login, /uploads/**) are unaffected.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String AUTH_ERROR_ATTRIBUTE = "authError";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Not authorised, no token");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            String userId = jwtUtil.extractUserId(token);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                request.setAttribute(AUTH_ERROR_ATTRIBUTE, "User not found");
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException ex) {
            request.setAttribute(AUTH_ERROR_ATTRIBUTE, "Token invalid or expired");
        }

        filterChain.doFilter(request, response);
    }
}
