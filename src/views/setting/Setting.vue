<template>
  <div class="setting">
    <h1>设置</h1>
    <el-tabs tab-position="left">
      <el-tab-pane label="个人资料" class="content">
        <Personal-data></Personal-data>
      </el-tab-pane>
      <el-tab-pane label="更改密码" class="content">
        <Password></Password>
      </el-tab-pane>
      <el-tab-pane label="账号和安全" class="content">
        <el-button type="danger" :icon="Delete" @click="cancelAccount">注销账号</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, computed, reactive } from "vue";
import { Delete } from "@element-plus/icons-vue";
import PersonalData from "./PersonalData.vue";
import Password from "./Password.vue";
import { HttpManager } from "@/api";
import { useStore } from "vuex";
import mixin from "@/mixins/mixin";
import { RouterName } from "@/enums";

export default defineComponent({
  components: {
    PersonalData,
    Password,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const { routerManager } = mixin();

    const userId = computed(() => store.getters.userId);

    async function cancelAccount() {
      const result = (await HttpManager.deleteUser(userId.value)) as ResponseBody;
      (proxy as any).$message({
        message: result.message,
        type: result.type,
      });
      routerManager(RouterName.SignIn, { path: RouterName.SignIn });
      proxy.$store.commit("setToken", false);
    }

    return {
      Delete,
      cancelAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.setting {
  background: #fff;
  border-radius: 18px;
  box-shadow: $shadow-sm;
  border: 1px solid $theme-border;
}

h1 {
  font-size: 22px;
  font-weight: 600;
  color: $theme-text-primary;
  padding: 22px 24px;
  border-bottom: 1px solid $theme-border;
  display: flex;
  align-items: center;
}
h1::before {
  content: "";
  width: 4px;
  height: 22px;
  border-radius: 4px;
  background: $theme-gradient;
  margin-right: 12px;
}

.content {
  padding: 30px 24px;
  text-align: center;
}

.setting:deep(.el-tabs--left) {
  padding: 16px 0;
}
.setting:deep(.el-tabs__item.is-left) {
  text-align: left;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  color: $theme-text-secondary;
  transition: all 0.2s ease;
}
.setting:deep(.el-tabs__item.is-active) {
  color: $color-blue-active;
  font-weight: 600;
  background: rgba(91, 141, 239, 0.08);
}
.setting:deep(.el-tabs__active-bar) {
  background: $theme-gradient;
  width: 3px !important;
  border-radius: 3px;
}

@media screen and (min-width: $sm) {
  .setting {
    margin: 30px 10%;
    margin-top: 30px;
    min-height: 60vh;
  }
}

@media screen and (max-width: $sm) {
  .setting {
    margin: 16px 12px;
  }
  h1 {
    padding: 16px 18px;
    font-size: 18px;
  }
  .content {
    padding: 20px 16px;
  }
}
</style>
