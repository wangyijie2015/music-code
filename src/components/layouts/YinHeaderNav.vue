<template>
  <ul class="yin-header-nav">
    <li :class="{ active: item.name === activeName }" v-for="item in styleList" :key="item.path" @click="handleChangeView(item)">
      {{ item.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";

export default defineComponent({
  props: {
    styleList: Array,
    activeName: String,
  },
  emits: ["click"],
  setup() {
    const { proxy } = getCurrentInstance();

    function handleChangeView(item) {
      proxy.$emit("click", item.path, item.name);
    }
    return {
      handleChangeView,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.yin-header-nav {
  display: flex;
  align-items: center;
}

li {
  position: relative;
  margin: $header-nav-margin;
  padding: $header-nav-padding;
  line-height: 3.3rem;
  color: $theme-text-secondary;
  cursor: pointer;
  font-size: 15px;
  transition: color 0.2s ease;
}

li::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 14px;
  width: 0;
  height: 3px;
  border-radius: 2px;
  background: $theme-gradient;
  transform: translateX(-50%);
  transition: width 0.25s ease;
}

li:hover {
  color: $theme-text-primary;
}

li.active {
  color: $theme-text-primary;
  font-weight: 600;
}

li.active::after {
  width: 28px;
}
</style>
