package com.example.yin.controller;

import com.example.yin.common.R;
import com.example.yin.mapper.MvCollectMapper;
import com.example.yin.mapper.MvLikeMapper;
import com.example.yin.model.domain.MvCollect;
import com.example.yin.model.domain.MvLike;
import com.example.yin.model.request.MvRequest;
import com.example.yin.service.MvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

@RestController
public class MvController {

    @Autowired
    private MvService mvService;

    @Autowired
    private MvLikeMapper mvLikeMapper;

    @Autowired
    private MvCollectMapper mvCollectMapper;

    @GetMapping("/mv")
    public R allMv() {
        return mvService.allMv();
    }

    @PostMapping("/mv/add")
    public R addMv(@RequestBody MvRequest addMvRequest) {
        return mvService.addMv(addMvRequest);
    }

    @PostMapping("/mv/update")
    public R updateMvMsg(@RequestBody MvRequest updateMvRequest) {
        return mvService.updateMvMsg(updateMvRequest);
    }

    @DeleteMapping("/mv/delete")
    public R deleteMv(@RequestParam int id) {
        return mvService.deleteMv(id);
    }

    @GetMapping("/mv/detail")
    public R mvOfId(@RequestParam int id) {
        return mvService.mvOfId(id);
    }

    @GetMapping("/mv/singerName/detail")
    public R mvOfSingerName(@RequestParam String name) {
        return mvService.mvOfSingerName(name);
    }

    @PostMapping("/mv/img/update")
    public R updateMvPic(@RequestParam("file") MultipartFile urlFile, @RequestParam("id") int id) {
        String fileName = System.currentTimeMillis() + urlFile.getOriginalFilename();
        String filePath = System.getProperty("user.dir") + "/img/songPic";
        File file1 = new File(filePath);
        if (!file1.exists() && !file1.mkdirs()) {
            return R.fatal("创建文件夹失败");
        }
        File dest = new File(filePath + "/" + fileName);
        String storeUrlPath = "/img/songPic/" + fileName;
        try {
            urlFile.transferTo(dest);
        } catch (IOException e) {
            return R.fatal("上传失败" + e.getMessage());
        }
        return R.success("上传成功", storeUrlPath);
    }

    @PostMapping("/mv/url/update")
    public R updateMvUrl(@RequestParam("file") MultipartFile urlFile, @RequestParam("id") int id) {
        String fileName = urlFile.getOriginalFilename();
        String filePath = System.getProperty("user.dir") + "/movie";
        File file1 = new File(filePath);
        if (!file1.exists() && !file1.mkdirs()) {
            return R.fatal("创建文件夹失败");
        }
        File dest = new File(filePath + "/" + fileName);
        String storeUrlPath = "/movie/" + fileName;
        try {
            urlFile.transferTo(dest);
        } catch (IOException e) {
            return R.fatal("上传失败" + e.getMessage());
        }
        return R.success("上传成功", storeUrlPath);
    }

    // =======================> MV 点赞
    @PostMapping("/mv/like")
    public R toggleLike(@RequestParam Integer mvId, @RequestParam Integer userId) {
        MvLike one = mvLikeMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvLike>()
                        .eq("mv_id", mvId).eq("user_id", userId));
        if (one != null) {
            mvLikeMapper.deleteById(one.getId());
            return R.success("取消点赞", false);
        } else {
            MvLike like = new MvLike();
            like.setMvId(mvId);
            like.setUserId(userId);
            mvLikeMapper.insert(like);
            return R.success("点赞成功", true);
        }
    }

    @GetMapping("/mv/like/count")
    public R likeCount(@RequestParam Integer mvId) {
        long count = mvLikeMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvLike>()
                        .eq("mv_id", mvId));
        return R.success(null, count);
    }

    @GetMapping("/mv/like/status")
    public R likeStatus(@RequestParam Integer mvId, @RequestParam Integer userId) {
        long count = mvLikeMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvLike>()
                        .eq("mv_id", mvId).eq("user_id", userId));
        return R.success(null, count > 0);
    }

    // =======================> MV 收藏
    @PostMapping("/mv/collect")
    public R toggleCollect(@RequestParam Integer mvId, @RequestParam Integer userId) {
        MvCollect one = mvCollectMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvCollect>()
                        .eq("mv_id", mvId).eq("user_id", userId));
        if (one != null) {
            mvCollectMapper.deleteById(one.getId());
            return R.success("取消收藏", false);
        } else {
            MvCollect collect = new MvCollect();
            collect.setMvId(mvId);
            collect.setUserId(userId);
            mvCollectMapper.insert(collect);
            return R.success("收藏成功", true);
        }
    }

    @GetMapping("/mv/collect/count")
    public R collectCount(@RequestParam Integer mvId) {
        long count = mvCollectMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvCollect>()
                        .eq("mv_id", mvId));
        return R.success(null, count);
    }

    @GetMapping("/mv/collect/status")
    public R collectStatus(@RequestParam Integer mvId, @RequestParam Integer userId) {
        long count = mvCollectMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MvCollect>()
                        .eq("mv_id", mvId).eq("user_id", userId));
        return R.success(null, count > 0);
    }

    @GetMapping("/mv/test")
    public R testMv(@RequestParam("path") String path) {
        File file = new File(System.getProperty("user.dir") + "/movie/" + path);
        return R.success("filePath: " + file.getAbsolutePath() + ", exists: " + file.exists());
    }

    @GetMapping("/mv/play")
    public void playMv(@RequestParam("path") String path, HttpServletRequest request, HttpServletResponse response) throws IOException {
        File file = new File(System.getProperty("user.dir") + "/movie/" + path);
        if (!file.exists()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        String mimeType = "video/mp4";
        long fileLength = file.length();
        String rangeHeader = request.getHeader("Range");

        response.setHeader("Accept-Ranges", "bytes");
        response.setContentType(mimeType);

        if (rangeHeader == null) {
            response.setContentLengthLong(fileLength);
            try (InputStream is = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
                copy(is, os, fileLength);
            }
            return;
        }

        try {
            String range = rangeHeader.substring("bytes=".length());
            String[] parts = range.split("-", 2);
            long start = Long.parseLong(parts[0]);
            long end = parts.length > 1 && !parts[1].isEmpty() ? Long.parseLong(parts[1]) : fileLength - 1;

            if (start > end || start >= fileLength) {
                response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
                response.setHeader("Content-Range", "bytes */" + fileLength);
                return;
            }

            long contentLength = Math.min(end - start + 1, fileLength - start);

            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
            response.setHeader("Content-Range", "bytes " + start + "-" + (start + contentLength - 1) + "/" + fileLength);
            response.setContentLengthLong(contentLength);

            try (InputStream is = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
                is.skip(start);
                copy(is, os, contentLength);
            }
        } catch (NumberFormatException e) {
            response.setContentLengthLong(fileLength);
            try (InputStream is = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
                copy(is, os, fileLength);
            }
        }
    }

    private void copy(InputStream is, OutputStream os, long length) throws IOException {
        byte[] buffer = new byte[8192];
        long remaining = length;
        while (remaining > 0) {
            int bytesRead = is.read(buffer, 0, (int) Math.min(buffer.length, remaining));
            if (bytesRead == -1) break;
            os.write(buffer, 0, bytesRead);
            remaining -= bytesRead;
        }
    }
}
