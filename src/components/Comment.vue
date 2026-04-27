<template>
  <div class="comment">
    <h2 class="comment-title">
      <span>评论</span>
      <span class="comment-desc">共 {{ commentList.length }} 条评论</span>
    </h2>
    <el-input class="comment-input" type="textarea" placeholder="期待您的精彩评论..." :rows="2" v-model="textarea" />
    <el-button class="sub-btn" type="primary" @click="submitComment()">发表评论</el-button>
  </div>
  <div v-if="commentLoading" class="comment-loading">加载中...</div>
  <ul v-else-if="commentList.length" class="popular">
    <li v-for="(item, index) in commentList" :key="index">
      <el-image class="popular-img" fit="contain" :src="attachImageUrl(item.avator)" />
      <div class="popular-msg">
        <ul>
          <li class="name">{{ item.username }}</li>
          <li class="time">{{ formatDate(item.createTime) }}</li>
          <li class="content">{{ item.content }}</li>
        </ul>
      </div>
      <!--这特么是直接拿到了评论的id-->
      <div ref="up" class="comment-ctr" @click="setSupport(item.id, item.up, userId)">
        <div><yin-icon :icon="iconList.Support"></yin-icon> {{ item.up }}</div>
        <el-icon v-if="item.userId === userId" @click="deleteComment(item.id, index)"><delete /></el-icon>
      </div>
    </li>
  </ul>
  <div v-else class="comment-empty">暂无评论，快来抢沙发吧~</div>
</template>

<script lang="ts" setup>
import { defineProps, getCurrentInstance, ref, toRefs, computed, watch, reactive, onMounted } from "vue";
import { useStore } from "vuex";
import { Delete } from "@element-plus/icons-vue";

import YinIcon from "@/components/layouts/YinIcon.vue";
import mixin from "@/mixins/mixin";
import { HttpManager } from "@/api";
import { Icon } from "@/enums";
import { formatDate } from "@/utils";

const { proxy } = getCurrentInstance();
const store = useStore();
const { checkStatus } = mixin();

const props = defineProps({
  playId: [Number, String], // 歌曲ID 或 歌单ID
  type: Number, // 歌单 1 / 歌曲 0
});

const { playId, type } = toRefs(props);
const textarea = ref(""); // 存放输入内容
const commentList = ref([]); // 存放评论内容
const commentLoading = ref(false);
const iconList = reactive({
  Support: Icon.Support,
});

const userId = computed(() => store.getters.userId);
const songId = computed(() => store.getters.songId);

watch(songId, () => {
  if (songId.value && type.value === 0) {
    getComment(songId.value);
  }
});

onMounted(() => {
  getComment(playId.value);
});

// 获取所有评论
async function getComment(id) {
  if (!id) return;
  commentLoading.value = true;
  try {
    const result = (await HttpManager.getAllComment(type.value, id)) as ResponseBody;
    commentList.value = result.data;

    // 并行获取评论用户的昵称和头像
    const userPromises = commentList.value.map((comment) =>
      HttpManager.getUserOfId(comment.userId).then((res) => {
        const userData = (res as ResponseBody).data[0];
        comment.avator = userData.avator;
        comment.username = userData.username;
      })
    );
    await Promise.all(userPromises);
  } catch (error) {
    console.error('[获取所有评论失败]===>', error);
  } finally {
    commentLoading.value = false;
  }
}

// 提交评论
async function submitComment() {
  if (!checkStatus()) return;

  // 0 代表歌曲， 1 代表歌单
  let songListId = null;
  let songId = null;
  let nowType = null;
  if (type.value === 1) {
    nowType = 1;
    songListId = `${playId.value}`;
  } else if (type.value === 0) {
    nowType = 0;
    songId = `${playId.value}`;
  }

  const content = textarea.value;
  const result = (await HttpManager.setComment({ userId: userId.value, content, songId, songListId, nowType })) as ResponseBody;
  (proxy as any).$message({
    message: result.message,
    type: result.type,
  });

  if (result.success) {
    textarea.value = "";
    await getComment(playId.value);
  }
}

// 删除评论
async function deleteComment(id, index) {
  const result = (await HttpManager.deleteComment(id)) as ResponseBody;
  (proxy as any).$message({
    message: result.message,
    type: result.type,
  });

  if (result.success) commentList.value.splice(index, 1);
}

// 点赞
async function setSupport(id, up, userId) {
  if (!checkStatus()) return;

  const commentId = id;
  const alreadySupported = ((await HttpManager.testAlreadySupport({ commentId, userId })) as ResponseBody).data;

  const newUp = alreadySupported ? up - 1 : up + 1;
  const [operatorR, result] = alreadySupported
    ? await Promise.all([
        HttpManager.deleteUserSupport({ commentId, userId }),
        HttpManager.setSupport({ id, up: newUp }),
      ])
    : await Promise.all([
        HttpManager.insertUserSupport({ commentId, userId }),
        HttpManager.setSupport({ id, up: newUp }),
      ]);

  if ((result as ResponseBody).success && (operatorR as ResponseBody).success) {
    await getComment(playId.value);
  }
}

const attachImageUrl = HttpManager.attachImageUrl;
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

/*评论*/
.comment {
  position: relative;
  margin-bottom: 60px;

  .comment-title {
    height: 50px;
    line-height: 50px;

    .comment-desc {
      font-size: 14px;
      font-weight: 400;
      color: $color-grey;
      margin-left: 10px;
    }
  }

  .comment-input {
    display: flex;
    margin-bottom: 20px;
  }

  .sub-btn {
    position: absolute;
    right: 0;
  }
}

/*热门评论*/
.popular {
  width: 100%;
  > li {
    border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    padding: 15px 0;
    display: flex;
    .popular-img {
      width: 50px;
    }

    .popular-msg {
      padding: 0 20px;
      flex: 1;
      li {
        width: 100%;
      }
      .time {
        font-size: 0.6rem;
        color: rgba(0, 0, 0, 0.5);
      }
      .name {
        color: rgba(0, 0, 0, 0.5);
      }
      .content {
        font-size: 1rem;
      }
    }

    .comment-ctr {
      display: flex;
      align-items: center;
      width: 80px;
      font-size: 1rem;
      cursor: pointer;

      .el-icon {
        margin: 0 10px;
      }

      &:hover,
      :deep(.icon):hover {
        color: $color-grey;
      }
    }
  }
}

.icon {
  @include icon(1em);
}

.comment-loading, .comment-empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
