package com.example.yin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.yin.common.R;
import com.example.yin.model.domain.Mv;
import com.example.yin.model.request.MvRequest;

public interface MvService extends IService<Mv> {

    R allMv();

    R addMv(MvRequest addMvRequest);

    R updateMvMsg(MvRequest updateMvRequest);

    R deleteMv(Integer id);

    R mvOfId(Integer id);

    R mvOfSingerName(String name);
}
