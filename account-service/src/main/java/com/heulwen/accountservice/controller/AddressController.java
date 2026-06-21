package com.heulwen.accountservice.controller;

import com.heulwen.accountservice.api.request.AddressRequest;
import com.heulwen.accountservice.api.response.AddressResponse;
import com.heulwen.accountservice.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(
            @RequestHeader("X-User-Id") Long userId
    ) {
        List<AddressResponse> response = addressService.getMyAddresses(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddressById(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        AddressResponse response = addressService.getAddressById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddressRequest request
    ) {
        AddressResponse response = addressService.createAddress(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddressRequest request
    ) {
        AddressResponse response = addressService.updateAddress(id, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        addressService.deleteAddress(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        AddressResponse response = addressService.setDefaultAddress(id, userId);
        return ResponseEntity.ok(response);
    }
}
