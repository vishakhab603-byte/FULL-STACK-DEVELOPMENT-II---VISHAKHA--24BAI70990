package com.example.backend;

import com.example.backend.entity.Task;
import com.example.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SpringBootApplication
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@EnableCaching
public class StudentTaskManagerApplication {

    private final TaskService taskService;

    @Autowired
    public StudentTaskManagerApplication(TaskService taskService) {
        this.taskService = taskService;
    }

    public static void main(String[] args) {
        SpringApplication.run(StudentTaskManagerApplication.class, args);
    }


    @GetMapping
    public Page<Task> getAllTasksPaginated(Pageable pageable) {
        return taskService.getTasksPaginated(pageable);
    }

    @GetMapping("/with-comments")
    public List<Task> getAllTasksWithComments() {
        return taskService.getAllTasksWithComments();
    }

    @GetMapping("/top")
    public List<Task> getTopTasks() {
        return taskService.getTop5Tasks();
    }

    @PostMapping
    public Task addTask(@RequestBody Task newTask) {
        return taskService.addTask(newTask);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Task with ID " + id + " has been deleted!";
    }

    @PutMapping("/{id}/toggle")
    public Task toggleTask(@PathVariable Long id) {
        return taskService.toggleTask(id);
    }
}
