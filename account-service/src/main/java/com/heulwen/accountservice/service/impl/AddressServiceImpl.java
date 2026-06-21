package com.heulwen.accountservice.service.impl;

import com.heulwen.accountservice.api.request.AddressRequest;
import com.heulwen.accountservice.api.response.AddressResponse;
import com.heulwen.accountservice.domain.models.Address;
import com.heulwen.accountservice.exception.AppException;
import com.heulwen.accountservice.exception.ErrorCode;
import com.heulwen.accountservice.mapper.AddressMapper;
import com.heulwen.accountservice.repository.AddressRepository;
import com.heulwen.accountservice.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return addressMapper.toResponseList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));
        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        List<Address> existing = addressRepository.findByUserId(userId);
        boolean isDefault = existing.isEmpty() || (request.isDefault() != null && request.isDefault());

        if (isDefault) {
            unsetCurrentDefault(userId);
        }

        Address address = Address.create(
                userId,
                request.addressName(),
                request.addressLine(),
                request.phone(),
                isDefault
        );

        Address saved = addressRepository.save(address);
        return addressMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long id, Long userId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        boolean willBeDefault = request.isDefault() != null && request.isDefault();
        if (willBeDefault && !address.getIsDefault()) {
            unsetCurrentDefault(userId);
        }

        address.update(
                request.addressName(),
                request.addressLine(),
                request.phone(),
                willBeDefault
        );

        Address saved = addressRepository.save(address);
        return addressMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            // Set another address as default if available
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getIsDefault()) {
            unsetCurrentDefault(userId);
            address.setDefault(true);
            address = addressRepository.save(address);
        }

        return addressMapper.toResponse(address);
    }

    private void unsetCurrentDefault(Long userId) {
        Optional<Address> currentDefaultOpt = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        if (currentDefaultOpt.isPresent()) {
            Address currentDefault = currentDefaultOpt.get();
            currentDefault.setDefault(false);
            addressRepository.save(currentDefault);
        }
    }
}
