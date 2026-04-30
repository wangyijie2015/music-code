<template>
  <div class="login-logo">
    <div class="bubble bubble-1"></div>
    <div class="bubble bubble-2"></div>
    <div class="bubble bubble-3"></div>
    <div class="logo-content">
      <yin-icon class="brand-icon" :icon="icon"></yin-icon>
      <h1 class="brand-title">Yin Music</h1>
      <p class="brand-desc">发现 · 聆听 · 分享你的音乐世界</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YinIcon from "./YinIcon.vue";
import { Icon } from "@/enums";

export default defineComponent({
  components: {
    YinIcon,
  },
  data() {
    return {
      icon: Icon.ERJI,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.login-logo {
  position: relative;
  background: $theme-gradient;
  height: calc(100vh - $header-height - $footer-height);
  min-width: 50vw;
  overflow: hidden;
  color: #fff;
  @include layout(center, center);

  .bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: float 8s ease-in-out infinite;
  }
  .bubble-1 {
    width: 280px;
    height: 280px;
    top: -60px;
    left: -60px;
    background: rgba(255, 255, 255, 0.12);
  }
  .bubble-2 {
    width: 220px;
    height: 220px;
    bottom: -40px;
    right: -40px;
    animation-delay: 2s;
  }
  .bubble-3 {
    width: 130px;
    height: 130px;
    top: 30%;
    right: 18%;
    animation-delay: 4s;
  }

  .logo-content {
    position: relative;
    text-align: center;
    z-index: 2;
    padding: 0 2rem;
  }

  .brand-icon {
    @include icon(7rem, #fff);
    margin-bottom: 1.4rem;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.25));
  }

  .brand-title {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 0.6rem;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }

  .brand-desc {
    font-size: 0.95rem;
    letter-spacing: 1.5px;
    opacity: 0.88;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20px) translateX(15px); }
}

@media screen and (min-width: $sm) {
  .login-logo {
    width: 50vw;
  }
}

@media screen and (max-width: $sm) {
  .login-logo {
    width: 100vw;
    .brand-icon {
      @include icon(5rem, #fff);
    }
    .brand-title {
      font-size: 1.8rem;
    }
  }
}
</style>
