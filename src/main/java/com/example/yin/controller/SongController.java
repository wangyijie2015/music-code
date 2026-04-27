package com.example.yin.controller;

import com.example.yin.common.R;
import com.example.yin.model.request.SongRequest;
import com.example.yin.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class SongController {

    @Autowired
    private SongService songService;


    // 添加歌曲
    @PostMapping("/song/add")
    public R addSong(SongRequest addSongRequest, @RequestParam("file") MultipartFile mpfile) {
        return songService.addSong(addSongRequest,mpfile);
    }

    // 删除歌曲
    @DeleteMapping("/song/delete")
    public R deleteSong(@RequestParam int id) {
        return songService.deleteSong(id);
    }

    // 返回所有歌曲
    @GetMapping("/song")
    public R allSong() {
        return songService.allSong();
    }

    //TODO ok
    // 返回指定歌曲ID的歌曲
    @GetMapping("/song/detail")
    public R songOfId(@RequestParam int id) {
        return songService.songOfId(id);
    }

    // 返回指定歌手ID的歌曲
    @GetMapping("/song/singer/detail")
    public R songOfSingerId(@RequestParam int singerId) {
        return songService.songOfSingerId(singerId);
    }

    // 返回指定歌手名的歌曲
    @GetMapping("/song/singerName/detail")
    public R songOfSingerName(@RequestParam String name) {
        return songService.songOfSingerName(name);
    }

    // 更新歌曲信息
    @PostMapping("/song/update")
    public R updateSongMsg(@RequestBody SongRequest updateSongRequest) {
        return songService.updateSongMsg(updateSongRequest);
    }

    // 更新歌曲图片
    @PostMapping("/song/img/update")
    public R updateSongPic(@RequestParam("file") MultipartFile urlFile, @RequestParam("id") int id) {
        return songService.updateSongPic(urlFile, id);
    }

    // 更新歌曲
    @PostMapping("/song/url/update")
    public R updateSongUrl(@RequestParam("file") MultipartFile urlFile, @RequestParam("id") int id) {
        return songService.updateSongUrl(urlFile, id);
    }

    // 播放歌曲
    @GetMapping("/song/{filename:.+}")
    public ResponseEntity<Resource> playSong(@PathVariable String filename) {
        String filePath = System.getProperty("user.dir") + "/song/" + filename;
        FileSystemResource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }
}
