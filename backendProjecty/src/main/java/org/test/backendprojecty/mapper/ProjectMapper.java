package org.test.backendprojecty.mapper;

import org.springframework.stereotype.Component;
import org.test.backendprojecty.dtos.response.ProjectResponse;
import org.test.backendprojecty.entity.Project;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
