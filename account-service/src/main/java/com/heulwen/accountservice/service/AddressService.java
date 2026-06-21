package com.heulwen.accountservice.service;

import com.heulwen.accountservice.api.request.AddressRequest;
import com.heulwen.accountservice.api.response.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getMyAddresses(Long userId);
    AddressResponse getAddressById(Long id, Long userId);
    AddressResponse createAddress(Long userId, AddressRequest request);
    AddressResponse updateAddress(Long id, Long userId, AddressRequest request);
    void deleteAddress(Long id, Long userId);
    AddressResponse setDefaultAddress(Long id, Long userId);
}
