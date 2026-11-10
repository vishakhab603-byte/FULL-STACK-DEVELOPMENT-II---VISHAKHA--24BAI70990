package com.example.backend.service;
import com.example.backend.entity.ProcessedEvent;
import com.example.backend.entity.ScheduledPost;
import com.example.backend.repository.ProcessedEventRepository;
import com.example.backend.repository.ScheduledPostRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
@Service public class KafkaConsumerService {
 private static final int MAX_ATTEMPTS=3; private final ScheduledPostRepository posts; private final ProcessedEventRepository processed; private final KafkaTemplate<String,ScheduledPost> kafka;
 public KafkaConsumerService(ScheduledPostRepository posts,ProcessedEventRepository processed,KafkaTemplate<String,ScheduledPost> kafka){this.posts=posts;this.processed=processed;this.kafka=kafka;}
 @KafkaListener(topics="post-topic",groupId="post-processing-group") @Transactional public void consumePostEvent(ScheduledPost post){String eventId=String.valueOf(post.getId());if(processed.existsById(eventId))return;for(int attempt=1;attempt<=MAX_ATTEMPTS;attempt++){post.setAttempts(attempt);try{publish(post);post.setStatus("PUBLISHED");posts.save(post);ProcessedEvent event=new ProcessedEvent();event.setEventId(eventId);event.setProcessedAt(LocalDateTime.now());processed.save(event);return;}catch(RuntimeException failure){if(attempt==MAX_ATTEMPTS){kafka.send("post-topic-dlq",eventId,post);post.setStatus("FAILED");posts.save(post);return;}try{Thread.sleep(250L*(1L<<(attempt-1)));}catch(InterruptedException interrupted){Thread.currentThread().interrupt();throw new IllegalStateException("Retry interrupted",interrupted);}}}}
 private void publish(ScheduledPost post){if(post.getContent()!=null&&post.getContent().contains("[[SIMULATE_FAILURE]]"))throw new IllegalStateException("Requested deterministic demo failure");}
}
