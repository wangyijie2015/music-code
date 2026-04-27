<template>
  <div class="mv-player-wrap" ref="playerWrap" @mousemove="showControls" @mouseleave="hideControls">
    <video ref="videoEl" class="mv-video" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMeta"
      @ended="onEnded" @play="onPlay" @pause="onPause" @click="togglePlay">
      <source :src="src" type="video/mp4" />
    </video>

    <!-- 中央播放按钮（暂停时显示） -->
    <div v-if="!playing" class="center-play" @click="togglePlay">
      <span class="play-icon">▶</span>
    </div>

    <!-- 底部控制栏 -->
    <div class="controls" :class="{ hidden: controlsHidden && playing }">
      <div class="progress-wrap" @mousedown="seekStart">
        <div class="progress-track">
          <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
          <div class="progress-thumb" :style="{ left: playedPercent + '%' }"></div>
        </div>
      </div>

      <div class="controls-main">
        <div class="controls-left">
          <button class="ctrl-btn" @click="togglePlay">{{ playing ? '⏸' : '▶' }}</button>
          <span class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        </div>

        <div class="controls-right">
          <div class="volume-wrap">
            <button class="ctrl-btn" @click="toggleMute">{{ muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊' }}</button>
            <input class="volume-slider" type="range" min="0" max="1" step="0.05" v-model.number="volume" @input="setVolume" />
          </div>

          <div class="speed-wrap">
            <button class="ctrl-btn" @click.stop="toggleSpeedMenu">{{ speed }}x</button>
            <div class="speed-menu" v-show="speedOpen" @mouseleave="speedOpen = false">
              <div v-for="s in speeds" :key="s" class="speed-item" :class="{ active: speed === s }" @click="setSpeed(s)">{{ s }}x</div>
            </div>
          </div>

          <button class="ctrl-btn" @click="toggleFullscreen">⛶</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";

export default defineComponent({
  name: "MvPlayer",
  props: {
    src: { type: String, default: "" },
  },
  setup(props) {
    const videoEl = ref<HTMLVideoElement | null>(null);
    const playerWrap = ref<HTMLDivElement | null>(null);

    const playing = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(1);
    const muted = ref(false);
    const speed = ref(1);
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const speedOpen = ref(false);
    const controlsHidden = ref(false);
    let hideTimer: number | null = null;

    const playedPercent = computed(() => {
      if (duration.value === 0) return 0;
      return (currentTime.value / duration.value) * 100;
    });

    function showControls() {
      controlsHidden.value = false;
      if (hideTimer) clearTimeout(hideTimer);
      if (playing.value) {
        hideTimer = window.setTimeout(() => {
          controlsHidden.value = true;
          speedOpen.value = false;
        }, 3000);
      }
    }

    function hideControls() {
      if (playing.value) {
        hideTimer = window.setTimeout(() => {
          controlsHidden.value = true;
          speedOpen.value = false;
        }, 1000);
      }
    }

    function togglePlay() {
      const video = videoEl.value;
      if (!video) return;
      if (video.paused) video.play();
      else video.pause();
    }

    function onPlay() { playing.value = true; }
    function onPause() { playing.value = false; }
    function onEnded() { playing.value = false; }

    function onTimeUpdate() {
      const video = videoEl.value;
      if (video) currentTime.value = video.currentTime;
    }

    function onLoadedMeta() {
      const video = videoEl.value;
      if (video) duration.value = video.duration;
    }

    function seekStart(e: MouseEvent) {
      const track = (e.target as HTMLElement).closest('.progress-wrap') as HTMLElement;
      if (!track || !videoEl.value) return;
      seekAt(e.clientX, track);
      const onMove = (ev: MouseEvent) => seekAt(ev.clientX, track);
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    function seekAt(clientX: number, track: HTMLElement) {
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (videoEl.value) {
        videoEl.value.currentTime = pct * duration.value;
      }
    }

    function setVolume() {
      const video = videoEl.value;
      if (video) {
        video.volume = volume.value;
        video.muted = volume.value === 0;
        muted.value = video.muted;
      }
    }

    function toggleMute() {
      const video = videoEl.value;
      if (!video) return;
      video.muted = !video.muted;
      muted.value = video.muted;
      if (!video.muted && volume.value === 0) {
        volume.value = 0.5;
        video.volume = 0.5;
      }
    }

    function toggleSpeedMenu() {
      speedOpen.value = !speedOpen.value;
    }

    function setSpeed(s: number) {
      speed.value = s;
      speedOpen.value = false;
      if (videoEl.value) videoEl.value.playbackRate = s;
    }

    function toggleFullscreen() {
      if (!playerWrap.value) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerWrap.value.requestFullscreen();
      }
    }

    function formatTime(t: number): string {
      if (!t || isNaN(t)) return "0:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return m + ":" + (s < 10 ? "0" : "") + s;
    }

    return {
      videoEl, playerWrap, playing, currentTime, duration,
      volume, muted, speed, speeds, speedOpen, controlsHidden,
      playedPercent, showControls, hideControls,
      togglePlay, onPlay, onPause, onEnded, onTimeUpdate, onLoadedMeta,
      seekStart, setVolume, toggleMute, toggleSpeedMenu, setSpeed,
      toggleFullscreen, formatTime,
    };
  },
});
</script>

<style scoped>
.mv-player-wrap {
  position: relative;
  width: 100%;
  max-width: 800px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.mv-video {
  display: block;
  width: 100%;
  max-height: 70vh;
  outline: none;
}

/* 中央播放按钮 */
.center-play {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}
.play-icon {
  font-size: 48px;
  color: #fff;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  transition: transform 0.2s;
}
.play-icon:hover { transform: scale(1.1); }

/* 底部控制栏 */
.controls {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 30px 12px 10px;
  transition: opacity 0.3s;
}
.controls.hidden { opacity: 0; pointer-events: none; }

.progress-wrap {
  height: 12px;
  cursor: pointer;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  position: relative;
  transition: height 0.15s;
}
.progress-wrap:hover .progress-track { height: 6px; }
.progress-played {
  height: 100%;
  background: #00a1d6;
  border-radius: 2px;
  position: relative;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #00a1d6;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.15s;
}
.progress-wrap:hover .progress-thumb { opacity: 1; }

.controls-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.15); }

.time {
  color: #fff;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.volume-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}
.volume-slider {
  width: 60px;
  height: 4px;
  accent-color: #00a1d6;
}

.speed-wrap {
  position: relative;
}
.speed-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0,0,0,0.9);
  border-radius: 6px;
  padding: 4px 0;
  margin-bottom: 4px;
}
.speed-item {
  padding: 6px 20px;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.speed-item:hover { color: #fff; background: rgba(255,255,255,0.1); }
.speed-item.active { color: #00a1d6; }
</style>
