package com.example.yin.common;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

public class FileUtils {

    public static String uploadFile(MultipartFile file, String relativeDir) {
        String fileName = System.currentTimeMillis() + file.getOriginalFilename();
        String filePath = System.getProperty("user.dir") + File.separator
                + relativeDir.replace("/", File.separator);
        File dest = new File(filePath + File.separator + fileName);
        if (!dest.getParentFile().exists() && !dest.getParentFile().mkdirs()) {
            throw new RuntimeException("创建文件夹失败");
        }
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("上传失败: " + e.getMessage());
        }
        return "/" + relativeDir + "/" + fileName;
    }
}
