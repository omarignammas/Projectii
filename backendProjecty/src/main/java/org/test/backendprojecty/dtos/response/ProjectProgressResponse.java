package org.test.backendprojecty.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressResponse {
    private Long projectId;
    private String projectTitle;
    private long totalTasks;
    private long completedTasks;
    private double progressPercentage;
}
