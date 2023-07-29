import { Image } from "react-native"
import { Box } from "rn-faiez-components"

export default (props) => {
    const { imageURI } = props.route.params
    return <Box flex>
        <Image source={{ uri: imageURI }} style={{ flex: 1, resizeMode: 'contain' }} />
    </Box>
}