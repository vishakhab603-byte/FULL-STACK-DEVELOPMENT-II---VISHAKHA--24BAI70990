package com.nexus.social;
import org.springframework.scheduling.annotation.Scheduled; import org.springframework.stereotype.Component;
@Component public class PublishingScheduler { private final SocialService service; public PublishingScheduler(SocialService service){this.service=service;} @Scheduled(fixedDelayString="${social.scheduler-delay-ms:15000}") public void publishDue(){service.publishDue();} }
