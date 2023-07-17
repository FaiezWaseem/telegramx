import { useState, useRef } from 'react';
import { Center, Text, Button } from 'rn-faiez-components';
import { Image, TextInput, ActivityIndicator } from 'react-native';
import KeyboardAvoider from '../../components/KeyboardAvoider';
import colors from '../../utils/Color';
const logo = require('../../../assets/icon.png');
import mtproto from '../../utils/mtproto';
import { Screen } from '../../utils/Constants';
export default function ({ navigation }) {
  const [phone, setPhone] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const input = useRef(null);


  const ContinueClicked = async () => {
    if (isLoading) return;
    if (phone.length > 0) {
      setLoading(true)
      try {
        const { phone_code_hash } = await mtproto.SignInWithPhoneNumber(phone);
        navigation.push(Screen.CODE, {
          phone,
          phone_code_hash
        })
        setLoading(false)

      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
  }

  return (
    <Center flex bg={colors.white}>
      <KeyboardAvoider
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          background: colors.white,
        }}>
        <Image
          source={logo}
          style={{
            width: 160,
            height: 160,
            marginBottom: 10,
          }}
        />
        <Text fontSize={22}>Telegram</Text>
        <Text mb={10} color={colors.gray}>
          Enter phone number to continue
        </Text>
        <TextInput
          placeholder="Phone"
          selectionColor={colors.primary}
          style={{
            alignSelf: 'stretch',

            marginHorizontal: 16,
            marginBottom: 4,

            paddingHorizontal: 16,
            paddingVertical: 16,

            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#ccc',
            borderRadius: 12,
            fontSize: 16,
          }}
          keyboardType="phone-pad"
          maxLength={13}
          ref={input}
          onChangeText={setPhone}
        />
        <Button

          onPress={ContinueClicked}
          style={{
            alignSelf: 'stretch',
            backgroundColor: colors.primary,

            marginHorizontal: 16,

            paddingHorizontal: 16,
            paddingVertical: 16,

            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: colors.primary,
            borderRadius: 12,
          }}
          txtStyle={{
            color: colors.white,

            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1.5,

            fontSize: 16,
            fontWeight: '500',
          }}>
          {isLoading ? <ActivityIndicator color={'white'} /> : "Continue"}
        </Button>
      </KeyboardAvoider>
    </Center>
  );
}
