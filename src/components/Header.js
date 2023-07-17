import { TouchableOpacity } from 'react-native';
import { Row, Text } from 'rn-faiez-components';
import { Ionicons } from '@expo/vector-icons';

export default function AppBar({
  leftIconPress,
  rightIconPress,
  isrightIcon,
  rightIcon,
  leftIcon,
  title,
  bg,
  iconSize,
  txtSize,
  isImage,
  imageComp,
  isMenu,
  menuComp,
}) {
  return (
    <Row
      h={50}
      justifyContent="space-between"
      alignItems={'center'}
      bg={bg}
      p={2}
      pt={4}
      pb={4}
      e={3}>
      <Row alignItems={'center'}>
        <TouchableOpacity
          onPress={leftIconPress}
          style={{
            marginLeft: 15,
          }}>
          <Ionicons
            name={leftIcon ? leftIcon : 'ios-menu'}
            size={iconSize ?? 30}
            color="black"
          />
        </TouchableOpacity>
        {isImage && imageComp()}
        <Text fontSize={txtSize ?? 22} ml={15}>
          {title}
        </Text>
      </Row>
      <Row ml={15}>
        {isrightIcon && (
          <TouchableOpacity
            onPress={rightIconPress}>
            <Ionicons
              name={rightIcon ? rightIcon : 'search'}
              size={iconSize ?? 30}
              color="black"
            />
          </TouchableOpacity>
        )}
        {isMenu && menuComp()}
      </Row>
    </Row>
  );
}
