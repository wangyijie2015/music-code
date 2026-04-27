package com.example.yin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.yin.common.R;
import com.example.yin.mapper.AdminMapper;
import com.example.yin.model.domain.Admin;
import com.example.yin.model.request.AdminRequest;
import com.example.yin.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;

import static com.example.yin.constant.Constants.SALT;

@Service
public class AdminServiceImpl extends ServiceImpl<AdminMapper, Admin> implements AdminService {

    @Override
    public R verityPasswd(AdminRequest adminRequest, HttpSession session) {
        QueryWrapper<Admin> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name", adminRequest.getUsername());
        String secretPassword = DigestUtils.md5DigestAsHex((SALT + adminRequest.getPassword()).getBytes(StandardCharsets.UTF_8));
        queryWrapper.eq("password", secretPassword);
        if (baseMapper.selectCount(queryWrapper) > 0) {
            session.setAttribute("name", adminRequest.getUsername());
            return R.success("登录成功");
        } else {
            return R.error("用户名或密码错误");
        }
    }
}
