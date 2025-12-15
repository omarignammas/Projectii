package org.test.backendprojecty.mapper;

import org.springframework.stereotype.Component;
import org.test.backendprojecty.dtos.response.TaskResponse;
import org.test.backendprojecty.entity.Task;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate())
                .completed(task.isCompleted())
                .projectId(task.getProject().getId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
