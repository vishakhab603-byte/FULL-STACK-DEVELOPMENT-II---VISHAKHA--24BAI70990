package com.example.backend.repository;

import com.example.backend.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {


    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN FETCH t.comments")
    List<Task> findAllWithComments();

    @Query(value = "SELECT * FROM tasks ORDER BY id DESC LIMIT 5", nativeQuery = true)
    List<Task> findTop5TasksNative();
}
