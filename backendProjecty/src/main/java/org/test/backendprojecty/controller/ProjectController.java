package org.test.backendprojecty.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.ProjectRequest;
import org.test.backendprojecty.dtos.response.ProjectProgressResponse;
import org.test.backendprojecty.dtos.response.ProjectResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.service.ProjectService;


@RestController
@RequestMapping("${BaseUrl}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PagingResult<ProjectResponse>> findAllApplication(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) Sort.Direction direction
    ) {
        PaginationRequest request =
                new PaginationRequest(page, size, sortField, direction);

        PagingResult<ProjectResponse> projects =
                projectService.getAllProjects(request);

        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long projectId) {
        ProjectResponse response = projectService.getProjectById(projectId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/progress")
    public ResponseEntity<ProjectProgressResponse> getProjectProgress(@PathVariable Long projectId) {
        ProjectProgressResponse response = projectService.getProjectProgress(projectId);
        return ResponseEntity.ok(response);
    }
}
