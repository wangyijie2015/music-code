package com.example.yin.model.request;

import lombok.Data;

@Data
public class MvRequest {
    private Integer id;

    private String mvName;

    private String singerName;

    private String url;

    private String pic;

    private String introduction;
}
