import base64 from 'react-native-base64'
import * as FileSystem from 'expo-file-system';
class AppCache {

    static UTF8 = FileSystem.EncodingType.UTF8
    static Base64 = FileSystem.EncodingType.Base64
    static documentDirectory = FileSystem.documentDirectory
    
    static getPath(path = 'example.png') {
        return FileSystem.cacheDirectory  + path
    }
    static async save(path, data , encoding = AppCache.UTF8) {
        await FileSystem.writeAsStringAsync(path, data, { encoding })
    }
    static async getFileInfo(path) {
        return await FileSystem.getInfoAsync(path)
    }
    static async loadFile(path , encoding = AppCache.UTF8) {
        try {
            const response = await FileSystem.readAsStringAsync(path, { encoding: encoding })
            return response
        } catch (error) {
           return error
        }
    }
    static async createDir(dir) {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
            console.log(" directory doesn't exist, creating...");
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
    }
    static getAllFilesIn(dir, callback) {
        FileSystem.readDirectoryAsync(dir).then(file => {
            callback(file);
        })
    }
    static async deleteFrom(path) {
        await FileSystem.deleteAsync(path);
    }
}

export default AppCache