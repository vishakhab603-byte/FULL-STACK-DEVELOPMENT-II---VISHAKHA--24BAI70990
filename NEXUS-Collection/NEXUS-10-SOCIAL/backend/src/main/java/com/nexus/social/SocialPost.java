package com.nexus.social;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="social_posts") public class SocialPost {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=32) private String platform;
 @Column(nullable=false,length=1000) private String body;
 @Column(nullable=false) private Instant scheduledAt;
 @Column(nullable=false,length=16) private String status="SCHEDULED";
 private Instant createdAt=Instant.now(); private Instant publishedAt;
 protected SocialPost(){}
 public SocialPost(String platform,String body,Instant scheduledAt){this.platform=platform;this.body=body;this.scheduledAt=scheduledAt;}
 public Long getId(){return id;} public String getPlatform(){return platform;} public String getBody(){return body;} public Instant getScheduledAt(){return scheduledAt;} public String getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public Instant getPublishedAt(){return publishedAt;}
 public void publish(Instant at){this.status="PUBLISHED";this.publishedAt=at;}
}
