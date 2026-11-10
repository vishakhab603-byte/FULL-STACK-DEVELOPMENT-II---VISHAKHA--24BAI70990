package com.nexus.social;
import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.web.server.ResponseStatusException;
import java.time.Instant; import java.util.*;
@Service public class SocialService {
 private final SocialPostRepository repo; public SocialService(SocialPostRepository repo){this.repo=repo;}
 public List<SocialPost> list(){return repo.findAllByOrderByCreatedAtDesc();}
 public SocialPost schedule(String platform,String body,Instant at){if(platform==null||!Set.of("Instagram","LinkedIn","X","Facebook").contains(platform))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a supported channel"); if(body==null||body.isBlank()||body.length()>1000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Post text must be 1–1000 characters");if(at==null||at.isBefore(Instant.now()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a future time");return repo.save(new SocialPost(platform,body.trim(),at));}
 @Transactional public List<SocialPost> publishDue(){var due=repo.findByStatusAndScheduledAtLessThanEqual("SCHEDULED",Instant.now());due.forEach(p->p.publish(Instant.now()));return due;}
 public Map<String,Object> analytics(){long total=repo.count(),scheduled=repo.countByStatus("SCHEDULED"),published=repo.countByStatus("PUBLISHED");return Map.of("total",total,"scheduled",scheduled,"published",published,"channels",Map.of("Instagram",repo.countByPlatform("Instagram"),"LinkedIn",repo.countByPlatform("LinkedIn"),"X",repo.countByPlatform("X"),"Facebook",repo.countByPlatform("Facebook")));}
 public void delete(long id){if(!repo.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Post not found");repo.deleteById(id);}
}
