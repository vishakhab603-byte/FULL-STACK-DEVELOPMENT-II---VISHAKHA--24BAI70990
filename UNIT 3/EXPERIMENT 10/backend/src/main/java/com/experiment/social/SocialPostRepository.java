package com.experiment.social;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant; import java.util.List;
public interface SocialPostRepository extends JpaRepository<SocialPost,Long>{ List<SocialPost> findAllByOrderByCreatedAtDesc(); List<SocialPost> findByStatusAndScheduledAtLessThanEqual(String status,Instant due); long countByStatus(String status); long countByPlatform(String platform); }
