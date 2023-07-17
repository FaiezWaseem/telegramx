import { useState , useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Box, Row, Text, Column, PBox, width } from 'rn-faiez-components';
import AppBar from '../../components/Header';
import colors from '../../utils/Color';
import { Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../utils/Constants';
import mtproto from '../../utils/mtproto';
import Cache from '../../utils/Cache';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';

export default ({ navigation }) => {
  const [me, setMe] = useState({})
  const [userFullInfo, setUserFullInfo] = useState({})
  const [profileImage, setProfileImage] = useState('')
  useEffect(() => {
    const isMe = Cache.getSessionValue('user', Cache.JSON) || null;
    if (isMe) {
      console.log(isMe)
      setUserFullInfo(isMe)
      setMe(isMe.users[0])
    }
    (async () => {
      const imageCache = Cache.getSessionValue('user.profile', Cache.DEFAULT) || null
      if (imageCache) {
        console.log(`loading image from cache`)
        setProfileImage(imageCache)
        return;
      }
      const base64 = await mtproto.getProfilePhoto(isMe.full_user.profile_photo.id)
      console.log(`HOORAY BASE64 GOT  `, base64)
      Cache.setSessionValue('user.profile', base64, Cache.DEFAULT)
      setProfileImage(base64)
    })()
  }, [])

  return (
    <Box flex bg={colors.white}>
      <AppBar
        leftIcon={'arrow-back'}
        isMenu
        menuComp={() => <CustomMenu />}
        bg={colors.white}
        leftIconPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView>
        <Row p={4} mt={10} w={width(100)} e={3}>
          <Image
            source={{
              uri:  profileImage ?? 'https://randomuser.me/api/portraits/men/52.jpg',
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 64,
              marginRight: 15,
              marginLeft: 15,
            }}
          />
          <Column ml={8}>
            <Text fontSize={24} fontWeight={'bold'}>
              {me?.first_name +' '+me?.last_name}
            </Text>
            <Text color={colors.gray3}>online</Text>
            <PBox
              position={'absolute'}
              bottom={-40}
              right={-90}
              bg={colors.primary}
              p={16}
              rounded={64}
              zIndex={44}
              onPress={() => {
                console.log('hey');
              }}>
              <MaterialCommunityIcons
                name="image-plus"
                size={25}
                color={colors.white}
              />
            </PBox>
          </Column>
        </Row>

        <Column p={10} pl={15}>
          <Text color={colors.primary} fontWeight={'600'}>
            Account
          </Text>
          <PBox mt={10} mb={5}>
            <Text fontWeight={'400'}>{me?.phone}</Text>
            <Text fontSize={12} fontWeight={'400'} color={colors.gray2}>
              Tap to Change Phone Number
            </Text>
          </PBox>
          <PBox mt={10} mb={5}>
            <Text fontWeight={'400'}>@{me?.username}</Text>
            <Text fontSize={12} fontWeight={'400'} color={colors.gray2}>
              Username
            </Text>
          </PBox>
          <PBox
            mt={10}
            mb={5}
            onPress={() => {
              navigation.push(Screen.EDITPROFILE, {
                type: 'BIO',
              });
            }}>
            <Text fontWeight={'400'}>{userFullInfo?.full_user?.about}</Text>
            <Text fontSize={12} fontWeight={'400'} color={colors.gray2}>
              Bio
            </Text>
          </PBox>
        </Column>
        <Box h={10} bg={colors.gray5} />

        <Column p={10} pl={15}>
          <Text color={colors.primary} fontWeight={'600'}>
            Settings
          </Text>
          <Row alignItems={'center'} mt={15}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text ml={15}>Chat Setting</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <AntDesign name="lock1" size={24} color="black" />
            <Text ml={15}>Privacy & Security</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <Text ml={15}>Notifications & Sounds</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <Feather name="pie-chart" size={24} color="black" />
            <Text ml={15}>Data & Storage</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <Ionicons name="md-battery-charging" size={24} color="black" />
            <Text ml={15}>Power Saving</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <Ionicons name="folder-open-outline" size={24} color="black" />
            <Text ml={15}>Chat Folders</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <MaterialIcons name="devices" size={24} color="black" />
            <Text ml={15}>Devices</Text>
          </Row>
          <Row alignItems={'center'} mt={15}>
            <MaterialCommunityIcons name="web" size={24} color="black" />
            <Text ml={15}>Language</Text>
          </Row>
        </Column>

        <Box p={10} bg={colors.gray5}>
          <Text
            color={colors.gray}
            style={{
              textAlign: 'center',
            }}>
            A Telegram Client made on React Native{' '}
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
};

const CustomMenu = () => {
  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);
  const icon = 'ios-ellipsis-vertical-outline';
  return (
    <Box>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            onPress={showMenu}
            style={{
              marginRight: 15,
            }}>
            <Ionicons name={icon} size={25} color="black" />
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}>
        <MenuItem onPress={hideMenu}>{'Edit Name'}</MenuItem>
        <MenuItem onPress={hideMenu}>{'Set Profile Photo'}</MenuItem>
        <MenuDivider />
        <MenuItem onPress={hideMenu}>{'Log Out'}</MenuItem>
      </Menu>
    </Box>
  );
};
