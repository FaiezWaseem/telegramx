import React from 'react';
import { Box } from 'rn-faiez-components';
import { View, StyleSheet } from 'react-native';
import { RecyclerListView, DataProvider } from 'recyclerlistview';
import { LayoutUtil } from './LayoutUtils';

let dataProvider = new DataProvider((r1, r2) => {
  return r1 !== r2;
});

const layoutProvider = LayoutUtil.getLayoutProvider();
const MyListView = (props) => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    if (props.data.length > 0) {
      setData(props.data);
    }
  }, [props.data]);
  dataProvider = dataProvider.cloneWithRows(data);

  //Only render RLV once you have the data
  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <RecyclerListView
          scrollViewProps={props.refreshControl}
          style={{ flex: 1 }}
          contentContainerStyle={{ margin: 3 }}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          rowRenderer={props.component}
          onEndReached={props.onEndReached}
          onEndReachedThreshold={props.onEndReachedThreshold}
          canChangeSize
          forceNonDeterministicRendering
          
        />
      ) : (
        <Box />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    transform : [{scaleY : -1}] 
  },
});

export default MyListView;
