<template>
  <ul class="yin-nav">
    <li v-for="(item, index) in styleList" :key="index" :class="{ active: item.name == activeName }" @click="handleChangeView(item)">
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

    function handleChangeView(val) {
      proxy.$emit("click", val);
    }
    return {
      handleChangeView,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.yin-nav {
  width: 100%;
  padding: 18px 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  li {
    line-height: 2rem;
    font-size: 0.92rem;
    color: $theme-text-secondary;
    cursor: pointer;
    padding: 4px 16px;
    border-radius: 999px;
    transition: all 0.2s ease;
  }
  li:hover {
    color: $color-blue-active;
    background: rgba(91, 141, 239, 0.08);
  }
  li.active {
    color: #fff;
    font-weight: 500;
    background: $theme-gradient;
    box-shadow: 0 4px 12px rgba(91, 141, 239, 0.3);
  }
}

@media screen and (min-width: $sm) {
  .yin-nav {
    li {
      margin: 0;
    }
  }
}

@media screen and (max-width: $sm) {
  .yin-nav {
    padding: 12px 4px;
    li {
      font-size: 0.85rem;
      padding: 4px 12px;
    }
  }
}
</style>
