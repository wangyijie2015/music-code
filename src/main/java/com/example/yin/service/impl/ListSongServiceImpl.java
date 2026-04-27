package com.example.yin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.yin.common.R;
import com.example.yin.mapper.ListSongMapper;
import com.example.yin.model.domain.ListSong;
import com.example.yin.model.request.ListSongRequest;
import com.example.yin.service.ListSongService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListSongServiceImpl extends ServiceImpl<ListSongMapper, ListSong> implements ListSongService {

    @Override
    public List<ListSong> allListSong() {
        return baseMapper.selectList(null);
    }

    @Override
    public R updateListSongMsg(ListSongRequest updateListSongRequest) {
        ListSong listSong = new ListSong();
        BeanUtils.copyProperties(updateListSongRequest, listSong);
        if (baseMapper.updateById(listSong) > 0) {
            return R.success("修改成功");
        } else {
            return R.error("修改失败");
        }
    }

    @Override
    public R deleteListSong(Integer songId, Integer songListId) {
        QueryWrapper<ListSong> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("song_id", songId);
        queryWrapper.eq("song_list_id", songListId);
        if (baseMapper.delete(queryWrapper) > 0) {
            return R.success("删除成功");
        } else {
            return R.error("删除失败");
        }
    }

    @Override
    public R addListSong(ListSongRequest addListSongRequest) {
        ListSong listSong = new ListSong();
        BeanUtils.copyProperties(addListSongRequest, listSong);
        if (baseMapper.insert(listSong) > 0) {
            return R.success("添加成功");
        } else {
            return R.error("添加失败");
        }
    }

    @Override
    public R listSongOfSongId(Integer songListId) {
        QueryWrapper<ListSong> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("song_list_id", songListId);
        return R.success("查询成功", baseMapper.selectList(queryWrapper));
    }

}
