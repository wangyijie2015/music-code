package com.example.yin.constant;

import java.io.File;

public class Constants {
    /* 歌曲图片，歌手图片，歌曲文件，歌单图片等文件的存放路径 */
    public static String ASSETS_PATH = System.getProperty("user.dir").replace("\\", "/");

    public static String AVATAR_IMAGES_PATH = new File(ASSETS_PATH + "/avatorImages/").toURI().toString();
    public static String SONGLIST_PIC_PATH = new File(ASSETS_PATH + "/img/songListPic/").toURI().toString();
    public static String SONG_PIC_PATH = new File(ASSETS_PATH + "/img/songPic/").toURI().toString();
    public static String SONG_PATH = new File(ASSETS_PATH + "/song/").toURI().toString();
    public static String SINGER_PIC_PATH = new File(ASSETS_PATH + "/img/singerPic/").toURI().toString();
    public static String BANNER_PIC_PATH = new File(ASSETS_PATH + "/img/swiper/").toURI().toString();

    /* 盐值加密 */
    public static String SALT = "zyt";
}
