import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/Color';
import { Screen } from '../../utils/Constants';

export default ({ item, navigation }) => {
  return (
    <TouchableOpacity
      onPress={async () => {
        navigation.push(Screen.CHAT, {
          chat: item,
        });
      }}>
      <View
        style={[
          styles.chat,
          item.pinned ? { backgroundColor: colors.gray6 } : null,
        ]}>
        <ImageBackground
          source={!item.self && item.photo ? { uri: item.photo } : null}
          style={[
            styles.chatPhoto,
            !item.photo || item.self
              ? {
                  backgroundColor: item.self
                    ? colors.primary
                    : item.avatarColor,
                }
              : null,
          ]}
          imageStyle={{ borderRadius: 64 }}>
          {item.self ? (
            <MaterialCommunityIcons
              style={styles.chatSavedMessages}
              name="bookmark"
            />
          ) : !item.photo ? (
            <Text style={styles.chatPhotoText}>{item.avatarTitle}</Text>
          ) : null}

          {item.online ? <View style={styles.chatOnline}></View> : null}
        </ImageBackground>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.chatTitle}>
              <Text style={styles.chatTitleText} numberOfLines={1}>
                {item.title}
              </Text>

              {item.verified ? (
                <MaterialCommunityIcons
                  style={styles.chatVerified}
                  name="check-decagram"
                />
              ) : null}

              {item.muted ? (
                <MaterialCommunityIcons
                  style={styles.chatMuted}
                  name="volume-off"
                />
              ) : null}
            </View>

            <View style={styles.chatDateRead}>
              {item.out && item.read ? (
                <MaterialCommunityIcons
                  style={styles.chatRead}
                  name="check-all"
                />
              ) : item.out ? (
                <MaterialCommunityIcons style={styles.chatRead} name="check" />
              ) : null}

              <Text style={styles.chatDate}>{item.date}</Text>
            </View>
          </View>

          <View style={styles.chatFooter}>
            <Text style={styles.chatMessage} numberOfLines={2}>
              {!item.typing && item.out
                ? 'You: '
                : item.messageFrom
                ? item.messageFrom + ': '
                : ''}
              {item.typing
                ? 'Typing...'
                : item.messageService
                ? item.messageService
                : item.media && item.message
                ? item.media + ', ' + item.message
                : item.media
                ? item.media
                : item.message}
            </Text>

            {item.unreadCount && !item.out ? (
              <View
                style={[
                  styles.chatUnreadCount,
                  item.muted ? { backgroundColor: colors.gray } : null,
                ]}>
                <Text style={styles.chatUnreadCountText}>
                  {item.unreadCount}
                </Text>
              </View>
            ) : item.pinned ? (
              <MaterialCommunityIcons style={styles.chatPinned} name="pin" />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chat: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    flexDirection: 'row',

    height: 80,
  },

  chatPhoto: {
    width: 64,
    height: 64,

    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',

    margin: 8,
    borderRadius: 64,
  },
  chatPhotoText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  chatOnline: {
    width: 14,
    height: 14,
    backgroundColor: colors.green,
    borderRadius: 14,

    borderWidth: 2,
    borderColor: colors.white,

    position: 'absolute',
    top: 48,
    left: 48,
  },

  chatInfo: {
    flex: 1,
    height: 80,

    borderBottomWidth: 1,
    borderBottomColor: colors.gray6,

    paddingRight: 8,
  },

  chatHeader: {
    height: 32,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chatTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },

  chatDateRead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatDate: {
    fontSize: 14,
    marginLeft: 4,
    color: colors.gray,
  },
  chatRead: {
    fontSize: 18,
    color: colors.green,
  },
  chatPinned: {
    fontSize: 20,
    color: colors.gray,
  },
  chatVerified: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
  },
  chatMuted: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 4,
  },
  chatSavedMessages: {
    fontSize: 40,
    color: colors.white,

    textAlign: 'center',
  },

  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    height: 48,

    fontSize: 15,
    color: colors.gray,
  },
  chatUnreadCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 20,
    paddingHorizontal: 5,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.green,
  },
  chatUnreadCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});
