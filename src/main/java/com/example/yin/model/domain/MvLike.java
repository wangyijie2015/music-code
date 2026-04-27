package com.example.yin.model.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.util.Date;

@TableName(value = "mv_like")
@Data
public class MvLike {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private Integer mvId;

    private Integer userId;

    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
}
