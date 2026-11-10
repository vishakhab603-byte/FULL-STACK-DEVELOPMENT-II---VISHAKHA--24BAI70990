package com.nexus.social;
import org.springframework.web.bind.annotation.*; import java.time.Instant; import java.util.*;
@RestController @RequestMapping("/api") @CrossOrigin(origins="http://localhost:5173") public class SocialController {
 private final SocialService service; public SocialController(SocialService service){this.service=service;}
 public record ScheduleRequest(String platform,String body,Instant scheduledAt){}
 @GetMapping("/posts") public List<SocialPost> posts(){return service.list();}
 @PostMapping("/posts") public SocialPost schedule(@RequestBody ScheduleRequest request){return service.schedule(request.platform(),request.body(),request.scheduledAt());}
 @DeleteMapping("/posts/{id}") public void delete(@PathVariable long id){service.delete(id);}
 @GetMapping("/analytics") public Map<String,Object> analytics(){return service.analytics();}
}
