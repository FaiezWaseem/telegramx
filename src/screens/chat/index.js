import { useEffect, useState } from 'react';
import { Box, Row } from 'rn-faiez-components';
import {
  ImageBackground,
  TextInput,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import AppBar from '../../components/Header';
import MyListView from '../../components/RecyclerView/index';
import ChatMessage from './ChatMessage';
import KeyboardAvoider from '../../components/KeyboardAvoider';
import colors from '../../utils/Color';
import { Ionicons } from '@expo/vector-icons';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import mtproto from '../../utils/mtproto';
import Cache from '../../utils/Cache';

const BackgroundImages = [
  'https://w0.peakpx.com/wallpaper/425/514/HD-wallpaper-telegram-pattern-art-patterns.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrQJmJW18mEHpbuc7EeixtFyR7Ll6TL6YsToHiCkPw1yR5OgC8IAyCt4KC1wUswWhJrjQ&usqp=CAU',
  'https://i.pinimg.com/originals/f6/c1/0a/f6c10a01b8f7c3285fc660b0b0664e52.jpg',
  'https://w0.peakpx.com/wallpaper/154/372/HD-wallpaper-telegram-background-whatsapp-creative-android-pattern-texture-abstract.jpg',
];

export default ({ navigation, route }) => {
  const { chat } = route?.params
  const [chats, setChats] = useState([])
  const [offset, setOffset] = useState(0)
  const [currentUser , setUser] = useState({})
  const [isloading, setLoading] = useState(false)
  useEffect(() => {
    const me  = Cache.getSessionValue('user' , Cache.JSON) || null
    if(me){
      console.log(me)
      setUser(me.users[0])
    }
    getChats()
  }, [])

  const getChats = async () => {

    if(isloading) return;

    const key = `chat_${chat.id}_${offset}`;
    const isCached = Cache.getSessionValue(key , Cache.JSON) || null;
    if (isCached) {
      console.log('loading from Cached')
      setChats([ ...chats , ...isCached.messages])
      setOffset(isCached.offset)
      return;
    }

    setLoading(true)
    const res = await mtproto.getChats(chat , 100 , offset)
    setChats([ ...chats , ...res.messages])
    setOffset(res.offset)
    console.log(res)
    Cache.setSessionValue(key , res , Cache.JSON)
    setLoading(false)
  }
  return (
    <Box flex bg={colors.white}>
      <KeyboardAvoider
        style={{
          flex: 1,
        }}>
        <ImageBackground
          source={{ uri: BackgroundImages[3] }}
          style={{
            flex: 1,
          }}>
          <AppBar
            imageComp={() => (
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/men/52.jpg',
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 64,
                }}
              />
            )}
            isImage
            title={chat?.title}
            txtSize={16}
            leftIcon={'arrow-back'}
            isMenu
            menuComp={() => <CustomMenu />}
            iconSize={26}
            isrightIcon
            rightIcon={'search'}
            bg={colors?.white}
            leftIconPress={() => {
              navigation.goBack();
            }}
          />
          {isloading && <ActivityIndicator /> }

          {chats.length > 0 ? <MyListView
            data={chats}
            component={(type, value) => {
              return <ChatMessage item={value} currentUser={currentUser} />;
            }}
            onEndReached={()=>{
              console.log('end')
              getChats()
            }}
            onEndReachedThreshold={0.4}
          /> : <Box flex >
            <ActivityIndicator />
          </Box>}
          <Row
            p={8}
            mb={8}
            ml={8}
            mr={8}
            mt={3}
            bg={colors.white}
            alignItems={'center'}
            rounded={66}>
            <Ionicons
              name="add-circle"
              size={24}
              color="black"
              style={{
                marginHorizontal: 10,
              }}
            />
            <TextInput placeholder={'Write Something...'} style={{ flex: 1 }} />
            <Pressable>
              <Ionicons
                name="send"
                size={24}
                color="black"
                style={{
                  marginHorizontal: 10,
                }}
              />
            </Pressable>
          </Row>
        </ImageBackground>
      </KeyboardAvoider>
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
        <MenuItem onPress={hideMenu}>{'Set Wallpaper'}</MenuItem>
        <MenuItem onPress={hideMenu}>{'Clear History'}</MenuItem>
        <MenuItem onPress={hideMenu}>{'Delete Chat'}</MenuItem>
        <MenuDivider />
        <MenuItem onPress={hideMenu}>{'Add to Home Screen'}</MenuItem>
      </Menu>
    </Box>
  );
};
