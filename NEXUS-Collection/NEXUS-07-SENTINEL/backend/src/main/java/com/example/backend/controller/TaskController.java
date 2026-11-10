package com.example.backend.controller;

import com.example.backend.entity.Task;
import com.example.backend.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService service;
    public TaskController(TaskService service) { this.service = service; }

    @GetMapping public Page<Task> list(Pageable pageable) { return service.getTasksPaginated(pageable); }
    @GetMapping("/with-comments") public List<Task> withComments() { return service.getAllTasksWithComments(); }
    @GetMapping("/top") public List<Task> top() { return service.getTop5Tasks(); }
    @PostMapping @PreAuthorize("hasAnyRole('USER','ADMIN')") public Task create(@RequestBody Task task) { return service.addTask(task); }
    @PutMapping("/{id}/toggle") @PreAuthorize("hasAnyRole('USER','ADMIN')") public Task toggle(@PathVariable Long id) { return service.toggleTask(id); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public void delete(@PathVariable Long id) { service.deleteTask(id); }
}
