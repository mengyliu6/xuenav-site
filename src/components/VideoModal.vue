<template>
  <div>
    <div class="video-card" @click="open">
      <img :src="coverUrl" alt="Product support video cover" />
      <div class="play-btn">▶</div>
    </div>

    <div v-if="visible" class="video-modal" @click.self="close">
      <div class="video-wrapper">
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>

        <span class="close-btn" @click="close">✕</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  videoUrl: {
    type: String,
    default: "",
  },
  videoId: {
    type: String,
    default: "",
  },
  cover: {
    type: String,
    default: "",
  },
  start: {
    type: Number,
    default: 0,
  },
});

const visible = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const parseTimeToSeconds = (value) => {
  if (!value) return 0;

  const str = String(value).trim();

  if (/^\d+$/.test(str)) {
    return Number(str);
  }

  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)m/);
  const s = str.match(/(\d+)s/);

  return (
    Number(h?.[1] || 0) * 3600 +
    Number(m?.[1] || 0) * 60 +
    Number(s?.[1] || 0)
  );
};

const cleanVideoId = (value) => {
  return String(value || "")
    .split(/[?&]/)[0]
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 11);
};

const parseYoutubeVideo = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return {
      id: "",
      start: 0,
    };
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace("www.", "");
    const pathParts = url.pathname.split("/").filter(Boolean);

    const start = parseTimeToSeconds(
      url.searchParams.get("t") || url.searchParams.get("start")
    );

    let id = "";

    if (host === "youtu.be") {
      id = pathParts[0] || "";
    }

    if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") || "";
      }

      if (["embed", "shorts", "live"].includes(pathParts[0])) {
        id = pathParts[1] || "";
      }
    }

    return {
      id: cleanVideoId(id),
      start,
    };
  } catch {
    const matched = raw.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/
    );

    return {
      id: cleanVideoId(matched?.[1] || raw),
      start: 0,
    };
  }
};

const parsedVideo = computed(() => {
  return parseYoutubeVideo(props.videoUrl || props.videoId);
});

const finalStart = computed(() => {
  return props.start > 0 ? props.start : parsedVideo.value.start;
});

const coverUrl = computed(() => {
  if (props.cover) return props.cover;

  if (parsedVideo.value.id) {
    return `https://img.youtube.com/vi/${parsedVideo.value.id}/hqdefault.jpg`;
  }

  return "";
});

const embedUrl = computed(() => {
  if (!parsedVideo.value.id) return "";

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
  });

  if (finalStart.value > 0) {
    params.set("start", String(finalStart.value));
  }

  return `https://www.youtube.com/embed/${parsedVideo.value.id}?${params.toString()}`;
});
</script>