package com.heulwen.accountservice.mapper;

import com.heulwen.accountservice.api.response.AddressResponse;
import com.heulwen.accountservice.domain.models.Address;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class AddressMapper {

    public AddressResponse toResponse(Address address) {
        if (address == null) {
            return null;
        }
        return new AddressResponse(
                address.getId(),
                address.getUserId(),
                address.getAddressName(),
                address.getAddressLine(),
                address.getPhone(),
                address.getIsDefault(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }

    public List<AddressResponse> toResponseList(List<Address> addresses) {
        if (addresses == null) {
            return Collections.emptyList();
        }
        return addresses.stream().map(this::toResponse).toList();
    }
}
