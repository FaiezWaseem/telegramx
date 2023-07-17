import * as React from 'react';
import { Image, ActivityIndicator } from 'react-native';
import { Center, Text } from 'rn-faiez-components';
import colors from "../../utils/Color"
const logo = require('../../../assets/icon.png');
import { Screen } from '../../utils/Constants'
import mtproto from '../../utils/mtproto';
import Cache from '../../utils/Cache';
import AppCache from '../../utils/AppCache';

export default ({ navigation }) => {

  React.useEffect(() => {
    (async () => {
      try {
        await AppCache.createDir(AppCache.getPath('images/'))
        const me = await mtproto.getMe();
        console.log(me)
        if (me) {
          Cache.setSessionValue('user', me, Cache.JSON)
          navigation.replace(Screen.HOME)

        } else {
          navigation.replace(Screen.PHONE)
        }
      } catch (error) {
        if (error.error_message === 'AUTH_KEY_UNREGISTERED') {
          navigation.replace(Screen.PHONE)
        }
        console.log(error)
      }
    })()
  }, [])


  return (
    <Center flex bg={colors.white} >
      <Image
        source={logo}
        style={{
          width: 200,
          height: 200,
        }}
      />
      <Text fontSize={22} color={colors.black} mt={5} mb={5} >{'Telegram'}</Text>
      <ActivityIndicator color={colors.blue} />
    </Center>
  );
};
