import React from 'react'
import { Box, Input, Column , Text } from 'rn-faiez-components';
import colors from '../../utils/Color';
import AppBar from '../../components/Header';
export default ({ navigation , route }) => {

   const { type } = route?.params

  const ABOUT = `
    You can add a few lines about yourself.
    Anyone who Opens your profile will see this text.
  `;

  React.useEffect(()=>{
    console.log(type)
  },[])

  function getText(){
    switch(type){
      case 'BIO':
      return ABOUT
      default :
      return ''
    }
  }


  return (
    <Box flex bg={colors.white}>
      <AppBar
        leftIcon={'arrow-back'}
        isrightIcon
        rightIcon={'checkmark-circle-outline'}
        bg={colors.white}
        leftIconPress={() => {
          navigation.goBack();
        }}
        title={type}
      />
      <Column p={8} pl={15} pr={15} mt={15} >
        <Input underline w={'100%'} />
        <Text color={colors.gray} >{getText()}</Text>
      </Column>
    </Box>
  );
};
