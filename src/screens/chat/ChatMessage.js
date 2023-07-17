import { memo, useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Util } from '../../utils/mtproto-api';
import RemoteFile from '../../components/RemoteFile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;
import { Menu, MenuItem} from 'react-native-material-menu';


function ChatMessage({ item, currentUser, navigation }) {
  /**
   * @type {import('../../utils/getChats').MessageType}
   */
  const chat = item;

  const [isDownloading, setDownloading] = useState(false);
  const [total_downloaded, setTotal_downloaded] = useState('0Mib');

  const saveAndroidFile = async (fileBase64, fileName, mime_type) => {
    try {
      // const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileString = fileBase64;

      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return;
      }

      try {
        await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mime_type
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, fileString, {
              encoding: FileSystem.EncodingType.Base64,
            });
            alert('Report Downloaded Successfully');
          })
          .catch((e) => {});
      } catch (e) {
        throw new Error(e);
      }
    } catch (err) {}
  };

  const FileDownloadStart = async () => {
    const MediaID = chat?.media?.document?.id;
    const mediaAccessHash = chat?.media?.document?.access_hash;
    const MediaFileRefrence = chat?.media?.document?.file_reference;
    const MediaMimeType = chat?.media?.document?.mime_type;
    const MediaName =
      chat?.media?.document?.attributes?.[0]?.file_name ??
      `${MediaID}_NoNameMedia.` + MediaMimeType.split('/')[1];

    setDownloading(true);
    console.log('downlaoding started', item);
    //  downloadFile(
    //   'document',
    //   MediaID,
    //   mediaAccessHash,
    //   MediaFileRefrence,
    //   null,
    //   MediaName,
    //   (res) => {
    //     console.log(res);
    //     setTotal_downloaded(formatBytes(res.downloaded_till_now));
    //   }
    // )
    //   .then(async (file) => {
    //     setDownloading(false);
    //     console.log(file);
    //     await saveAndroidFile(file, MediaName, MediaMimeType);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  if (chat?._ === 'message') {
    const type = chat.media;
    if (!type) {
      return (
        <Wrapper
          chat={chat}
          currentUser={currentUser}
        />
      );
    }
    if (type?._ === 'messageMediaPhoto') {
      let Imagewidth = (chat?.media?.photo?.sizes[1].w)
      let ImageHieght = (chat?.media?.photo?.sizes[1].h)
      return (
        <Wrapper chat={chat} currentUser={currentUser}>
          <RemoteFile
            chatFile={chat}
            render={(props) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigation.push('ImageView', {
                    imageURI: props.blob,
                  });
                }}>
                <Image
                  source={{
                    uri: props.blob,
                  }}
                  style={{
                    width : Imagewidth,
                    height : ImageHieght,
                    resizeMode: 'contain',
                  }}
                />
              </TouchableWithoutFeedback>
            )}
          />
        </Wrapper>
      );
    }
    if (type._ === 'messageMediaDocument') {
      return (
        <Wrapper chat={chat} currentUser={currentUser}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                borderRadius: 64,
                backgroundColor: 'blue',
                padding: 2,
              }}
              onPress={FileDownloadStart}
              disabled={isDownloading}>
              {isDownloading ? (
                <ActivityIndicator />
              ) : (
                <MaterialCommunityIcons
                  name="folder-download"
                  size={20}
                  color="white"
                />
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 5 }}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 13,
                }}>
                {chat?.media?.document?.attributes?.[0]?.file_name ??
                  'NO Name.' + chat?.media?.document?.mime_type.split('/')[1]}
              </Text>
              <Text
                style={{
                  color: '#000',
                  fontSize: 11,
                }}>
                {isDownloading && total_downloaded + '/'}
                {Util.formatBytes(chat?.media?.document?.size)}
              </Text>
            </View>
          </View>
        </Wrapper>
      );
    }
    if (type._ === 'messageMediaWebPage') {
      return (
        <Wrapper chat={chat} currentUser={currentUser}>
          <TouchableOpacity
            onPress={() => {
              const _url = chat.media.webpage.url;
              Linking.openURL(_url);
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: 4,
                borderRadius: 6,
              }}>
              <MaterialCommunityIcons name="web-box" size={20} color="black" />

              <View style={{ marginLeft: 5 }}>
                <Text
                  style={{
                    color: '#000',
                    fontSize: 13,
                  }}>
                  {chat?.media?.webpage?.site_name}
                </Text>
                <Text
                  style={{
                    color: '#000',
                    fontSize: 11,
                  }}>
                  {chat?.media?.webpage?.title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Wrapper>
      );
    }
  }
  console.log('UnRecognized Message', chat);
  return <View></View>;
}

const Wrapper = ({ children, chat, currentUser, onPress }) => {
  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  return (
    <TouchableWithoutFeedback onPress={onPress} onLongPress={showMenu}>
      <View style={{ marginTop: 6, width: Dimensions.get('screen').width  , transform : [{scaleY : -1}] }}>
        <View
          style={[
            styles.ChatMessageContainer,
            {
              alignSelf:
                chat?.from_id?.user_id === currentUser?.id
                  ? 'flex-end'
                  : 'flex-start',
              borderBottomLeftRadius:
                chat?.from_id?.user_id === currentUser?.id ? 8 : 0,
              borderBottomRightRadius:
                chat?.from_id?.user_id === currentUser?.id ? 0 : 8,
            },
          ]}>
          {chat?.first_name?.length > 0 && (
            <Text
              style={styles.ChatUserName}
              selectable={true}
              selectionColor={'orange'}>
              {chat?.first_name}{' '}
              {chat?.verified && (
                <Icon name="verified" type="material" color={'blue'} />
              )}
            </Text>
          )}
          {children}
          {chat?.message?.length > 0 && (
            <Text
              style={styles.ChatTextMessage}
              selectable={true}
              selectionColor={'orange'}>
              {chat?.message}
            </Text>
          )}
          {chat?.reactions && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginVertical: 5,
              }}>
              {chat?.reactions?.results.map((reaction) => {
                return (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 13,
                      alignSelf: 'flex-end',
                      borderRadius: 64,
                      padding: 2,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      marginTop: 2,
                      marginLeft: 2,
                    }}>
                    {`${reaction?.reaction.emoticon} ${reaction?.count}`}
                  </Text>
                );
              })}
            </View>
          )}
          <Text
            style={{
              color: 'grey',
              fontSize: 12,
              alignSelf: 'flex-end',
            }}>
            {chat?.views && chat?.views + ' views '}{' '}
            {Util.showElapsedTime(chat?.date)}
          </Text>
          <CustomMenu
            visible={visible}
            hideMenu={hideMenu}
            showMenu={showMenu}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const CustomMenu = ({ visible, showMenu, hideMenu }) => {
  const icon = 'ios-ellipsis-vertical-outline';
  return (
    <View>
      <Menu
        visible={visible}
        onRequestClose={hideMenu}>
        <MenuItem onPress={hideMenu}>{'reply'}</MenuItem>
        <MenuItem onPress={hideMenu}>{'Copy'}</MenuItem>
        <MenuItem onPress={hideMenu}>{'Forward'}</MenuItem>
        <MenuItem onPress={hideMenu}  textStyle={{
          color : 'red'
        }} >{'Delete'}</MenuItem>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  ChatMessageContainer: {
    backgroundColor: 'white',
    maxWidth: Dimensions.get('screen').width * 0.8,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 8,
  },
  ChatTextMessage: {
    color: '#000',
    fontSize: 13,
  },
  ChatUserName: {
    color: 'blue',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default memo(ChatMessage);
