import { getBaseURL, get, post, deletes, postForm } from "./request";

const HttpManager = {
  // 获取图片信息
  attachImageUrl: (url) => url ? `${getBaseURL()}/${url.replace(/^\//, "")}` : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e0e0e0' width='100' height='100'/%3E%3Ctext x='50' y='55' font-size='14' text-anchor='middle' fill='%23999'%3E暂无图片%3C/text%3E%3C/svg%3E",
  // =======================> 用户 API 完成
  // 登录
  signIn: ({username,password}) => post(`user/login/status`, {username,password}),
  // 注册
  SignUp: ({username,password,sex,phoneNum,email,birth,introduction,location}) => post(`user/add`, {username,password,sex,phoneNum,email,birth,introduction,location}),
  // 删除用户
  deleteUser: (id) => deletes(`user/delete?id=${id}`),
  // 更新用户信息
  updateUserMsg: ({id,username,sex,phoneNum,email,birth,introduction,location}) => post(`user/update`, {id,username,sex,phoneNum,email,birth,introduction,location}),
  updateUserPassword: ({id,username,oldPassword,password}) => post(`user/updatePassword`, {id,username,oldPassword,password}),
  // 返回指定ID的用户
  getUserOfId: (id) => get(`user/detail?id=${id}`),
  // 通过 ID 或用户名模糊搜索用户（最多 20 条，password 已置空）
  searchUser: (keyword) => get(`user/search?keyword=${encodeURIComponent(keyword ?? "")}`),
  // 更新用户头像
  uploadUrl: (userId) => `${getBaseURL()}/user/avatar/update?id=${userId}`,

  // =======================> 歌单 API 完成
  // 获取全部歌单
  getSongList: () => get("songList"),
  // 获取歌单类型
  getSongListOfStyle: (style) => get(`songList/style/detail?style=${style}`),
  // 返回标题包含文字的歌单
  getSongListOfLikeTitle: (keywords) => get(`songList/likeTitle/detail?title=${keywords}`),
  // 返回歌单里指定歌单ID的歌曲
  getListSongOfSongId: (songListId) => get(`listSong/detail?songListId=${songListId}`),

  // =======================> 歌手 API  完成
  // 返回所有歌手
  getAllSinger: () => get("singer"),
  // 通过性别对歌手分类
  getSingerOfSex: (sex) => get(`singer/sex/detail?sex=${sex}`),

  // =======================> 收藏 API 完成
  // 返回的指定用户ID的收藏列表
  getCollectionOfUser: (userId) => get(`collection/detail?userId=${userId}`),
  // 添加收藏的歌曲 type: 0 代表歌曲， 1 代表歌单
  setCollection: ({userId,type,songId}) => post(`collection/add`,{userId,type,songId}),

  deleteCollection: (userId, songId) => deletes(`collection/delete?userId=${userId}&songId=${songId}`),

  isCollection: ({userId, type, songId}) => post(`collection/status`, {userId, type, songId}),

  // =======================> 评分 API 完成
  // 提交评分
  setRank: ({songListId,consumerId,score}) => post(`rankList/add`, {songListId,consumerId,score}),
  // 获取指定歌单的评分
  getRankOfSongListId: (songListId) => get(`rankList?songListId=${songListId}`),
  // 获取指定用户的歌单评分
  getUserRank: (consumerId, songListId) => get(`/rankList/user?consumerId=${consumerId}&songListId=${songListId}`),

  // =======================> 评论 API 完成
  // 添加评论
  setComment: ({userId,content,songId,songListId,nowType}) => post(`comment/add`, {userId,content,songId,songListId,nowType}),
  // 删除评论
  deleteComment: (id) => deletes(`comment/delete?id=${id}`),
  // 点赞
  setSupport: ({id,up}) => post(`comment/like`, {id,up}),
  // 返回所有评论
  getAllComment: (type, id) => {
    let url = "";
    if (type === 1) {
      url = `comment/songList/detail?songListId=${id}`;
    } else if (type === 0) {
      url = `comment/song/detail?songId=${id}`;
    }
    return get(url);
  },

  // =======================> 歌曲 API
  // 返回指定歌曲ID的歌曲
  getSongOfId: (id) => get(`song/detail?id=${id}`),
  // 批量获取歌曲信息（解决 N+1 查询）
  getSongOfIds: (ids) => get(`song/list/batch?ids=${ids.join(",")}`),
  // 返回指定歌手ID的歌曲
  getSongOfSingerId: (id) => get(`song/singer/detail?singerId=${id}`),
  // 返回指定歌手名的歌曲
  getSongOfSingerName: (keywords) => get(`song/singerName/detail?name=${keywords}`),
  // 下载音乐
  downloadMusic: (url) => get(url, { responseType: "blob" }),

  //======================> 点赞api的优化 避免有些是重复的点赞！新增数据表了得

  testAlreadySupport:({commentId,userId}) => post(`userSupport/test`, {commentId,userId}),

  deleteUserSupport:({commentId,userId}) => post(`userSupport/delete`, {commentId,userId}),

  insertUserSupport:({commentId,userId}) => post(`userSupport/insert`, {commentId,userId}),

  //获取所有的海报
  getBannerList: () => get("banner/getAllBanner"),

  // =======================> MV API
  // 获取全部MV
  getMvList: () => get("mv"),
  // 获取MV详情
  getMvOfId: (id) => get(`mv/detail?id=${id}`),
  // 获取MV视频地址
  getMvUrl: (url) => {
    if (!url) return "";
    const relativePath = url.replace(/^\/movie\//, "");
    return `${getBaseURL()}/mv/play?path=${encodeURIComponent(relativePath)}`;
  },
  // MV 点赞
  toggleMvLike: (mvId, userId) => post(`mv/like?mvId=${mvId}&userId=${userId}`),
  getMvLikeCount: (mvId) => get(`mv/like/count?mvId=${mvId}`),
  getMvLikeStatus: (mvId, userId) => get(`mv/like/status?mvId=${mvId}&userId=${userId}`),
  // MV 收藏
  toggleMvCollect: (mvId, userId) => post(`mv/collect?mvId=${mvId}&userId=${userId}`),
  getMvCollectCount: (mvId) => get(`mv/collect/count?mvId=${mvId}`),
  getMvCollectStatus: (mvId, userId) => get(`mv/collect/status?mvId=${mvId}&userId=${userId}`),

  // =======================> 私信 / 聊天 API
  // 我的会话伙伴 ID 列表（按最近消息倒序）
  getConversations: (userId) => get(`message/conversations?userId=${userId}`),
  // 与某人历史消息（倒序分页）
  getMessageHistory: ({ userId, peerId, page = 1, size = 20 }) =>
    get(`message/history?userId=${userId}&peerId=${peerId}&page=${page}&size=${size}`),
  // 总未读数
  getUnreadCount: (userId) => get(`message/unread/count?userId=${userId}`),
  // 标记会话为已读
  markMessageRead: (userId, peerId) => post(`message/read?userId=${userId}&peerId=${peerId}`),
  // 上传聊天媒体（图片 / 视频），type: "image" | "video"
  uploadChatMedia: (file: File, type: "image" | "video", onProgress?: (p: number) => void) => {
    const fd = new FormData();
    fd.append("file", file);
    return postForm(`message/upload?type=${type}`, fd, onProgress);
  },
};



export { HttpManager };
