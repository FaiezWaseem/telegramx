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
import { ProfileImage } from '../Home/ListItem'
import KeyboardAvoider from '../../components/KeyboardAvoider';
import colors from '../../utils/Color';
import { Ionicons } from '@expo/vector-icons';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import mtproto from '../../utils/mtproto';
import Cache from '../../utils/Cache';

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Buffer } from 'buffer'

const BackgroundImages = [
  'https://w0.peakpx.com/wallpaper/425/514/HD-wallpaper-telegram-pattern-art-patterns.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrQJmJW18mEHpbuc7EeixtFyR7Ll6TL6YsToHiCkPw1yR5OgC8IAyCt4KC1wUswWhJrjQ&usqp=CAU',
  'https://i.pinimg.com/originals/f6/c1/0a/f6c10a01b8f7c3285fc660b0b0664e52.jpg',
  'https://w0.peakpx.com/wallpaper/154/372/HD-wallpaper-telegram-background-whatsapp-creative-android-pattern-texture-abstract.jpg',
];

export default ({ navigation, route }) => {
  const { chat } = route?.params
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])
  const [offset, setOffset] = useState(0)
  const [currentUser, setUser] = useState({})
  const [isloading, setLoading] = useState(false)
  const [channel, setChannel] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  useEffect(() => {
    const me = Cache.getSessionValue('user', Cache.JSON) || null
    if (me) {
      setUser(me.users[0])
    }
    getChats()

    mtproto.getChannelInfo(chat.id, chat.accessHash)
      .then(res => {
        setChannel(res)
      })
      .catch(err => console.log('error', err))
  }, [])


  useEffect(() => {
    const updateShortMessage = mtproto.on('updateShortMessage', (update) => {
      const _user = users?.find(
        (user) => user.id === update?.user_id
      );
      console.log(_user, users, update)
      if (_user) {
        const __msg = {
          ...update,
          _: 'message',
          first_name: _user?.first_name ?? "",
          bot: _user?.bot ?? false,
          profile: _user?.photo ?? {},
          username: _user?.username ?? "",
          verified: _user?.verified ?? false,
          status: _user?.status ?? {},
          self: _user?.self ?? false,
          date: new Date().getMilliseconds() / 1000
        }
        setChats(oldMsg => [__msg, ...oldMsg])
      }
    })
    const updates = mtproto.on('updates', (update) => {
      console.log('updates', update)
      let _msg = update?.updates?.find(e => e._ === 'updateNewMessage')
      if (_msg) {
        _msg = _msg?.message
        const _user = users?.find(
          (user) => user.id === _msg?.from_id?.user_id
        )
        console.log(_user)
        const __msg = {
          ..._msg,
          first_name: _user?.first_name ?? "",
          bot: _user?.bot ?? false,
          profile: _user?.photo ?? {},
          username: _user?.username ?? "",
          verified: _user?.verified ?? false,
          status: _user?.status ?? {},
          self: _user?.self ?? false,
        }
        setChats(oldMsg => [__msg, ...oldMsg])
      }
    })
    return () => {
      updateShortMessage.off('updateShortMessage',()=>{console.log('updateShortMessage END')})
      updates.off('updates' , ()=> console.log('updates END'))
    }
  }, [])

  const getChats = async () => {

    if (isloading) return;

    const key = `chat_${chat.id}_${offset}`;
    const isCached = Cache.getSessionValue(key, Cache.JSON) || null;
    if (isCached) {
      console.log('loading from Cached')
      setChats([...chats, ...isCached.messages])
      setUsers([...users, ...isCached.users])
      setOffset(isCached.offset)
      return;
    }

    setLoading(true)
    const res = await mtproto.getChats(chat, 100, offset)
    setChats([...chats, ...res.messages])
    setUsers([...users, ...res.users])
    setOffset(res.offset)
    console.log(res)
    Cache.setSessionValue(key, res, Cache.JSON)
    setLoading(false)
  }


  const SendMessage = async () => {
    if (messageInput.length === 0) return;
    const response = await mtproto.sendTextMessage(chat, messageInput, [])
    setMessageInput('')
    console.log(response)
    var _msg = response?.updates?.find(e => e._ === 'updateNewMessage')
    if (_msg) {
      _msg = _msg?.message
      const _user = response?.users?.find(
        (user) => user.id === _msg?.from_id?.user_id
      )
      const __msg = {
        ..._msg,
        first_name: _user?.first_name ?? "",
        bot: _user?.bot ?? false,
        profile: _user?.photo ?? {},
        username: _user?.username ?? "",
        verified: _user?.verified ?? false,
        status: _user?.status ?? {},
        self: _user?.self ?? false,
      }
      setChats(oldMsg => [__msg, ...oldMsg])
    }

  }
  const selectDocumentForUpload = async () => {
    let file = await DocumentPicker.getDocumentAsync({
      multiple: true, type: '*/*',
      copyToCacheDirectory: false,
    });

    if (file.type == 'success') {
      console.log('Success Pick')
      console.log(file)
      try {
        console.log('reading File buffer as base64')
        const fileContents = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' })
        const result = await mtproto.uploadFile(Buffer.from(fileContents, 'base64'))
        console.log({
          date: new Date(),
          fileID: result.id,
          parts: result.parts,
          size: file.size,
          name: file.name
        })
        mtproto.sendMediaMessage(chat, {
          id: result.id,
          parts: result.parts,
          size: file.size,
          name: file.name,
          mime_type: file.mimeType
        }, messageInput ??  '').then(res => {
          console.log('sent', res)
          alert('File Sent')
        })
          .catch(err => console.log('error File Upload', err))
      } catch (e) {
        throw e
      }
    }

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
              <ProfileImage item={chat} size={44} />
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
            isbtmtext
            btmtext={channel?.full_chat?.online_count ? `${channel?.full_chat?.online_count} online , ${channel?.full_chat?.participants_count} members` : chat?.online ? 'Online' : 'offline'}
          />
          {isloading && <ActivityIndicator />}

          {chats.length > 0 ? <MyListView
            data={chats}
            component={(type, value) => {
              return <ChatMessage item={value} currentUser={currentUser} navigation={navigation} />;
            }}
            onEndReached={() => {
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
            <Pressable onPress={selectDocumentForUpload}>

              <Ionicons
                name="add-circle"
                size={24}
                color="black"
                style={{
                  marginHorizontal: 10,
                }}
              />
            </Pressable>
            <TextInput placeholder={'Write Something...'}
              value={messageInput}
              onChangeText={setMessageInput}
              style={{ flex: 1 }} />
            <Pressable
              onPress={SendMessage}
            >
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
