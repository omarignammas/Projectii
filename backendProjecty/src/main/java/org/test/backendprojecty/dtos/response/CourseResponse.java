package org.test.backendprojecty.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Long termId;
    private String colorTag;
    private String instructorName;
    private String instructorEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
