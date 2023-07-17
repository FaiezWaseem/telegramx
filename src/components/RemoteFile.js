import { useState, useEffect } from 'react'
import { ActivityIndicator } from "react-native"
import mtproto from '../utils/mtproto'
import AppCache from '../utils/AppCache'
import Cache from '../utils/Cache'
import * as FileSystem from 'expo-file-system';

export default function RemoteFile({ chatFile, type = 'photo', render }) {
    const [blob, setBlob] = useState()
    const [isLoading, setLoading] = useState(true)
    const path = AppCache.getPath('images/') + `image_${chatFile.media.photo.id}.jpg`;


    async function isInCache() {
        
        //   const info = await AppCache.getFileInfo(path)
        //   if(info.exists){
        //     console.log(info)
        //     let  base64 = await AppCache.loadFile(path , AppCache.Base64)
        //     base64 = base64.replace('dataimage/pngbase64' , `data:image/png;base64,`)
        //     return base64;
        //   }
        const isCached = Cache.getSessionValue(path, Cache.DEFAULT) || null
        if (isCached) {
            console.log(`temp cache`)
            return isCached
        }
        return null
    }

    useEffect(() => {
        let isSubscribed = true
        async function getRemoteFile() {
            if (!chatFile) {
                console.log("Remote File Id Not Found", chatFile)
                setLoading(false)
                return
            }
            const exists = await isInCache()
            if (exists) {
                console.log(exists)
                console.log(`loading from cache`)
                setBlob(exists)
                setLoading(false)
                return;
            }
            mtproto.downloadFile(
                type,
                chatFile?.media?.photo?.id ?? chatFile.media.webpage.photo.id,
                chatFile?.media?.photo?.access_hash ?? chatFile.media.webpage.photo.access_hash,
                chatFile?.media?.photo?.file_reference ?? chatFile.media.webpage.photo.file_reference,
                'y',
                (e) => {
                    console.log(e)
                }
            ).then((file) => {
                const base64File = `data:image/png;base64,` + file;
                console.log(base64File)
                if (isSubscribed) {
                    setLoading(false)
                    setBlob(base64File)
                    Cache.setSessionValue(path, base64File, Cache.DEFAULT)
                    AppCache.save(path, file, AppCache.Base64)
                }
            }).catch(err => {
                setLoading(false)
                console.log(err)
            })
        }

        getRemoteFile()
        return () => (isSubscribed = false)
    }, [chatFile])

    if (isLoading) {
        return <ActivityIndicator color='red' />
    }


    return render && render({ blob })
}