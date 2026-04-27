package com.example.yin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.yin.common.R;
import com.example.yin.mapper.MvMapper;
import com.example.yin.model.domain.Mv;
import com.example.yin.model.request.MvRequest;
import com.example.yin.service.MvService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class MvServiceImpl extends ServiceImpl<MvMapper, Mv> implements MvService {

    @Override
    public R allMv() {
        return R.success(null, baseMapper.selectList(null));
    }

    @Override
    public R addMv(MvRequest addMvRequest) {
        Mv mv = new Mv();
        BeanUtils.copyProperties(addMvRequest, mv);
        String pic = "/img/songPic/tubiao.jpg";
        mv.setPic(pic);
        if (baseMapper.insert(mv) > 0) {
            return R.success("添加成功");
        } else {
            return R.error("添加失败");
        }
    }

    @Override
    public R updateMvMsg(MvRequest updateMvRequest) {
        Mv mv = new Mv();
        BeanUtils.copyProperties(updateMvRequest, mv);
        if (baseMapper.updateById(mv) > 0) {
            return R.success("修改成功");
        } else {
            return R.error("修改失败");
        }
    }

    @Override
    public R deleteMv(Integer id) {
        if (baseMapper.deleteById(id) > 0) {
            return R.success("删除成功");
        } else {
            return R.error("删除失败");
        }
    }

    @Override
    public R mvOfId(Integer id) {
        return R.success(null, baseMapper.selectById(id));
    }

    @Override
    public R mvOfSingerName(String name) {
        QueryWrapper<Mv> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("singer_name", name);
        return R.success(null, baseMapper.selectList(queryWrapper));
    }
}
