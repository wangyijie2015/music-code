package com.example.yin.model.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.util.Date;

@TableName(value = "mv")
@Data
public class Mv {

    @TableId(type = IdType.AUTO)
    private Integer id;

    private String mvName;

    private String singerName;

    private String url;

    private String pic;

    private String introduction;

    private Date createTime;

    private Date updateTime;

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }
}
