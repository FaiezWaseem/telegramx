import MTProto from "@mtproto/core/envs/browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions";
import { TextEncoder, TextDecoder } from "web-encoding";
import Api from './mtproto-api'

polyfillGlobal("TextEncoder", () => TextEncoder);
polyfillGlobal("TextDecoder", () => TextDecoder);

class CustomStorage {
  set(key, value) {
    console.log("SET", key, value);
    return AsyncStorage.setItem(key, value);
  }

  get(key) {
    console.log("GET", key);
    return AsyncStorage.getItem(key);
  }
}

const mtproto  = new MTProto({
  api_id: '273729',
  api_hash: '0f7a4f1ed6c06469bf0ecf70ce92b49d',
  storageOptions: {
    instance: new CustomStorage(),
  },
});

export default new Api(mtproto)