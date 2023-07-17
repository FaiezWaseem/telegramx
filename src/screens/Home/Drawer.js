import { useEffect, useState } from 'react';
import { Box, height, Text, Row } from 'rn-faiez-components';
import { Image, TouchableOpacity } from 'react-native';
import colors from '../../utils/Color';
import { AntDesign } from '@expo/vector-icons';
import { Screen } from '../../utils/Constants'
import Cache from '../../utils/Cache'
import mtproto from '../../utils/mtproto'
export default function DrawerComponent({ navigation }) {
  const [me, setMe] = useState({})
  const [profileImage, setProfileImage] = useState('')
  useEffect(() => {
    const isMe = Cache.getSessionValue('user', Cache.JSON) || null;
    if (isMe) {
      setMe(isMe.users[0])
    } 
    (async () => {
      const imageCache = Cache.getSessionValue('user.profile' , Cache.DEFAULT) || null
      if(imageCache){
        setProfileImage(imageCache)
        return;
      }
      const base64 = await mtproto.getProfilePhoto(isMe.full_user.profile_photo.id)
      console.log(`HOORAY BASE64 GOT `)
      Cache.setSessionValue('user.profile' , base64 , Cache.DEFAULT)
      setProfileImage(base64)
    })()
  }, [])

  return (
    <Box flex bg={colors.white} e={3}x>
      <Box h={height('25')} bg={colors.primary} pt={height('5')} pl={10}>
        <Image
          source={{
            uri: profileImage ?? 'https://randomuser.me/api/portraits/men/1.jpg',
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 64,
          }}
        />
        <Text color={colors.white} mt={15}>
          {me?.first_name + ' ' + me?.last_name}
        </Text>
        <Text color={colors.white} mt={5}>
          +{me?.phone}
        </Text>
      </Box>
      <DrawerItem icon={'user'} content={'New Group'} />
      <DrawerItem icon={'addusergroup'} content={'Contacts'} />
      <DrawerItem icon={'phone'} content={'Calls'} />
      <DrawerItem icon={'team'} content={'People Nearby'} />
      <DrawerItem icon={'pushpino'} content={'Saved Messages'} />
      <DrawerItem icon={'setting'} content={'Settings'} onPress={() => {
        navigation.push(Screen.PROFILE)
      }} />
      <DrawerItem icon={'adduser'} content={'Invite Freinds'} />
    </Box>
  );
}

const DrawerItem = ({ icon, content, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Row p={6} mt={4} alignItems={'center'}>
        <AntDesign
          name={icon}
          size={26}
          color={colors.gray2}
          style={{
            marginRight: 15,
            marginLeft: 15,
          }}
        />
        <Text color={colors.black} fontSize={20}>
          {content}
        </Text>
      </Row>
    </TouchableOpacity>
  );
};
