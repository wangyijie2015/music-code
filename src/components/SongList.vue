<template>
  <div class="content">
    <div v-if="!dataList.length" class="empty-hint">暂无歌曲</div>
    <el-table v-else highlight-current-row :data="dataList" @row-click="handleClick">
      <el-table-column prop="songName" label="歌曲" />
      <el-table-column prop="singerName" label="歌手" />
      <el-table-column prop="introduction" label="专辑" />
      <el-table-column label="编辑" width="80" align="center">
        <template #default="scope">
          <el-dropdown>
            <el-icon @click="handleEdit(scope.row)"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :icon="Download"
                  @click="
                    downloadMusic({
                      songUrl: scope.row.url,
                      songName: scope.row.name,
                    })
                  ">下载</el-dropdown-item>
                <el-dropdown-item :icon="Delete" v-if="show" @click="deleteCollection({ id: scope.row.id })">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, toRefs, computed } from "vue";
import { useStore } from "vuex";
import { MoreFilled, Delete, Download } from "@element-plus/icons-vue";

import mixin from "@/mixins/mixin";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    MoreFilled,
  },
  props: {
    songList: Array,
    show: {
      default: false
    }
  },
  emits: ["changeData"],
  setup(props) {
    const { getSongTitle, getSingerName, playMusic, checkStatus, downloadMusic } = mixin();
    const { proxy } = getCurrentInstance();
    const store = useStore();

    const { songList } = toRefs(props);

    const songUrl = computed(() => store.getters.songUrl);
    const singerName = computed(() => store.getters.singerName);
    const songTitle = computed(() => store.getters.songTitle);
    const dataList = computed(() => {
      const list = [];
      songList.value.forEach((item: any, index) => {
        item["songName"] = getSongTitle(item.name);
        item["singerName"] = getSingerName(item.name);
        item["index"] = index;
        list.push(item);
      });
      return list;
    });

    function handleClick(row) {
      playMusic({
        id: row.id,
        url: row.url,
        pic: row.pic,
        index: row.index,
        name: row.name,
        lyric: row.lyric,
        currentSongList: songList.value,
      });
    }

    function handleEdit(row) {
      console.log("row", row);
    }

    const userId = computed(() => store.getters.userId);

    async function deleteCollection({ id }) {
      if (!checkStatus()) return;

      const result = (await HttpManager.deleteCollection(userId.value, id)) as ResponseBody;
      (proxy as any).$message({
        message: result.message,
        type: result.type,
      });

      if (result.data === false) proxy.$emit("changeData", result.data);
    }

    return {
      dataList,
      Delete,
      Download,
      songUrl,
      singerName,
      songTitle,
      handleClick,
      handleEdit,
      downloadMusic,
      deleteCollection,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.content {
  background-color: $color-white;
  border-radius: $border-radius-songlist;
  padding: 4px;
}

.content:deep(.el-table) {
  background: transparent;
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: rgba(91, 141, 239, 0.06);
}

.content:deep(.el-table th.el-table__cell) {
  background: transparent !important;
  color: $theme-text-secondary;
  font-weight: 500;
  border-bottom: 1px solid $theme-border;
}

.content:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(31, 35, 48, 0.04);
}

.content:deep(.el-table__row.current-row) {
  color: $color-blue-active !important;
  font-weight: 600;
  background: rgba(91, 141, 239, 0.06) !important;
}

.content:deep(.el-table__row) {
  cursor: pointer;
  transition: background 0.15s ease;
}

.icon {
  @include icon(1.2em, $theme-text-secondary);
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}
.icon:hover {
  color: $color-blue-active;
  transform: scale(1.1);
}

.empty-hint {
  text-align: center;
  padding: 50px 0;
  color: $theme-text-secondary;
  font-size: 14px;
}
</style>
