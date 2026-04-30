import { createStore } from "vuex";
import configure from "./configure";
import user from "./user";
import song from "./song";
import chat from "./chat";

export default createStore({
  modules: {
    configure,
    user,
    song,
    chat,
  },
});
