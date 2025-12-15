package org.test.backendprojecty.dtos.request;

import lombok.*;
import org.springframework.data.domain.Sort;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaginationRequest {

    private Integer page ;
    private Integer size ;
    private String sortField;
    private Sort.Direction direction;

}

