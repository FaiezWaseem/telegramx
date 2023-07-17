import React from 'react'
import Routes from "./src/navigation/index"
import { View } from 'react-native'
import Constants from 'expo-constants';
import WebviewCrypto from "react-native-webview-crypto";
import api from "./src/utils/mtproto";
export default () => {
  React.useEffect(()=>{
    (async()=>{
        await api.setNearestDc(4)
      })()
  },[])
    return (
        <View style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
            <WebviewCrypto />
            <Routes />
        </View>)

}