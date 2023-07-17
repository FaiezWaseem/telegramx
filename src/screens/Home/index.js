import React, { useEffect, useState, useRef } from 'react';
import { Box, PBox, height, width } from 'rn-faiez-components';
import colors from '../../utils/Color';
import Drawer from 'react-native-drawer';
import AppBar from '../../components/Header';
import DrawerComponent from './Drawer';
import { FontAwesome } from '@expo/vector-icons';
import { FlatList, ActivityIndicator } from 'react-native';
import ListItem from './ListItem';
import mtproto from '../../utils/mtproto';
import Cache from '../../utils/Cache'

export default function HomeScreen({ navigation }) {
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const ToggleDrawer = () => setDrawerOpen(!isDrawerOpen);
  const [chats, setChats] = useState([]);
  const loading = useRef(false);
  const [scrollEnd, setScrollEnd] = useState(true);
  const [offsetDate, setOffsetDate] = useState(0);



  useEffect(() => {
    loadDialogs()
  }, [])

  const loadDialogs = async () => {
    loading.current = true
    const key = `getChatHistory_${offsetDate}`
    const isCached = Cache.getSessionValue(key, Cache.JSON) || null
    if (isCached) {
      console.log(`Cached _________ ${key}`)
      setChats(isCached)
      loading.current = false
      return;
    }
    const history = await mtproto.getChatHistory(15, false, offsetDate);
    if (history?.processedChats.length > 0) {
      setChats([...chats, ...history?.processedChats])
      setOffsetDate(history.processedChats.slice(-1)[0].dateSeconds)
      Cache.setSessionValue(key, history.processedChats, Cache.JSON)
      loading.current = false
    } else {
      console.log('Reached End')
      loading.current = false
    }
  }
  const loadMoreDialogs = () => {
    loadDialogs()
  };


  return (
    <Box flex bg={colors.white}>
      <Drawer
        type="overlay"
        content={<DrawerComponent navigation={navigation} />}
        tapToClose={true}
        open={isDrawerOpen}
        openDrawerOffset={0.2} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        styles={drawerStyles}
        onClose={ToggleDrawer}
        tweenHandler={(ratio) => ({
          main: { opacity: (2 - ratio) / 2 },
        })}>
        <AppBar
          isleftIcon
          iconSize={26}
          txtSize={22}
          leftIconPress={() => {
            ToggleDrawer();
          }}
          rightIconPress={() => {
            console.log('Right Icon');
          }}
          title={'Telegram'}
          isrightIcon
          bg={'white'}
        />
        <FlatList
          onEndReached={loadMoreDialogs}
          onEndReachedThreshold={0.4}
          ListFooterComponent={() =>
            loading.current ? (
              <ActivityIndicator
                style={{
                  marginVertical: 32,
                  alignSelf: 'center',
                }}
              />
            ) : null
          }
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListItem item={item} navigation={navigation} />}
        />
      </Drawer>
      <PBox
        w={60}
        h={60}
        bg={colors.primary}
        rounded={60}
        p={8}
        position={'absolute'}
        bottom={height(5)}
        right={width(5)}
        alignItems={'center'}
        justifyContent={'center'}
        e={3}
        zIndex={2}>
        <FontAwesome name="pencil" size={24} color={colors.white} />
      </PBox>
    </Box>
  );
}
const drawerStyles = {
  drawer: { shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 1 },
  main: { paddingLeft: 3 },
};
