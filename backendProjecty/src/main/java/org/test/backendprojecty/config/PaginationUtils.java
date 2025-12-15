package org.test.backendprojecty.config;

import org.springframework.data.domain.PageRequest;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.springframework.data.domain.Pageable;

public final class PaginationUtils {

    private PaginationUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static Pageable getPageable(PaginationRequest request) {
        return PageRequest.of(
                request.getPage() - 1, //  0-based PageRequest !!!
                request.getSize(),
                request.getDirection(),
                request.getSortField()
        );
    }
}

