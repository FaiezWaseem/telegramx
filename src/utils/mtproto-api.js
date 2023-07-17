import { Buffer } from 'buffer';
class Util {
  static getAvatarTitle(...titles) {
    const res = [];

    for (const title of titles) {
      res.push(
        /\p{Extended_Pictographic}/u.test(title)
          ? title.slice(0, 2)
          : title?.[0]
      );
    }

    return res.join('');
  }
  static getAvatarColor(peerId) {
    const colors = [
      '#ff516a', // red
      '#54cb68', // green
      '#2a9ef1', // blue
      '#7b75f5', // violet
      '#d669ed', // pink
      '#28c9b7', // cyan
      '#ffa85c', // orange
    ];
    const colorsMap = [0, 6, 3, 1, 5, 2, 4];

    return colors[colorsMap[Math.abs(peerId) % 7]];
  }
  static getMediaType(message) {
    // Photo compressed
    if (message.media?._ === 'messageMediaPhoto') {
      return '📷 Photo';
    }

    if (message.media?._ === 'messageMediaDocument') {
      const attr = message.media?.document.attributes;

      // Sticker
      if (attr?.[1]?._ === 'documentAttributeSticker') {
        return attr?.[1]?.alt + ' Sticker';
      }

      // Photo uncompressed
      if (attr?.[0]?._ === 'documentAttributeImageSize') {
        return '📸 Image';
      }

      // GIF
      if (attr?.[2]?._ === 'documentAttributeAnimated') {
        return '📺 GIF';
      }

      // Audio
      if (attr?.[0]?._ === 'documentAttributeAudio') {
        if (attr?.[0].voice) {
          return '🎤 Voice message';
        }

        return '🔊 Audio file';
      }

      // Video
      if (attr?.[0]?._ === 'documentAttributeVideo') {
        if (attr?.[0].round_message) {
          return '🤳 Video message';
        }

        return '🎥 Video';
      }

      // File
      if (attr?.[0]?._ === 'documentAttributeFilename') {
        return '📁 File';
      }
    }

    return null;
  }
  /**
   *
   * @param {Number} a - Bytes
   * @param {Number} b - Value after point default = 2
   * @returns - Outputs HumanReadable File Size , ex : 4Mib 10Gib
   */
  static formatBytes(a, b = 2) {
    if (!+a) return '0 Bytes';
    const c = 0 > b ? 0 : b,
      d = Math.floor(Math.log(a) / Math.log(1024));
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][d]
      }`;
  }
  /**
   *
   * @param {Date.valueOf} timestamp - takes input of a unix timestamp  Date valueof
   * @returns {String} - formatted String with Time Pased ex: 2h , 1d , 3y
   */
  static showElapsedTime(timestamp) {
    if (typeof timestamp !== 'number') return 'NaN';

    const SECOND = 1000;
    const MINUTE = 1000 * 60;
    const HOUR = 1000 * 60 * 60;
    const DAY = 1000 * 60 * 60 * 24;
    const MONTH = 1000 * 60 * 60 * 24 * 30;
    const YEAR = 1000 * 60 * 60 * 24 * 30 * 12;

    const elapsed = new Date().valueOf() - new Date(1000 * timestamp).valueOf();
    // const elapsed = 1541309742360 - timestamp

    if (elapsed <= MINUTE) return `${Math.round(elapsed / SECOND)}s`;
    if (elapsed <= HOUR) return `${Math.round(elapsed / MINUTE)}m`;
    if (elapsed <= DAY) return `${Math.round(elapsed / HOUR)}h`;
    if (elapsed <= MONTH) return `${Math.round(elapsed / DAY)}d`;
    if (elapsed <= YEAR) return `${Math.round(elapsed / MONTH)}mo`;
    return `${Math.round(elapsed / YEAR)}y`;
  }
  static generateRandomId() {
    return (
      Math.ceil(Math.random() * 0xffffff) + Math.ceil(Math.random() * 0xffffff)
    );
  }
}

export { Util }

class Api {
  /**
   *
   * @param {Mtproto} _mtproto_instance - pass a mtproto instanse
   */
  constructor(_mtproto_instance = null) {
    if (_mtproto_instance) {
      this.mtproto = _mtproto_instance;
    } else {
      throw new Error('Please Provide a MTproto-core Instance');
    }
  }
  /**
   * ```
   *   //Call raw query
   *   const api = new Api(mtproto)
   *   await api.call('method' ,{ })
   *
   * ```
   *
   * @param {string} method
   * @param {Object} params
   * @param {Object} options
   * @returns {Promise}
   */
  async call(method, params, options = {}) {
    try {
      const result = await this.mtproto.call(method, params, options);

      return result;
    } catch (error) {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
        const ms = seconds * 1000;

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcIdAsString] = error_message.split('_MIGRATE_');

        const dcId = Number(dcIdAsString);

        // If auth.sendCode call on incorrect DC need change default DC, because
        // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await this.mtproto.setDefaultDc(dcId);
        } else {
          Object.assign(options, { dcId });
        }

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    }
  }
  /**
   *
   * @returns {Promise}  return the current user
   * ```
   *   const api = new Api(mtproto)
   *   const me = await api.getMe()
   * ```
   */
  async getMe() {
    return await this.mtproto.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });
  }
  /**
   *
   * @param {string} first_name
   * @param {string} last_name
   * @param {string} about
   * @returns {Promise}
   */
  async updateProfile(first_name, last_name, about) {
    return await this.mtproto.call('account.updateProfile', {
      first_name,
      last_name,
      about,
    });
  }
  /**
   *
   * @param {Object} user - pass an Object
   * @returns {Promise}
   *
   * @Example
   * ```
   *  const api = new Api(mtproto)
   *  const userInfo = await api.getFullUserInfo({
   *   id : 123, // user id
   *   access_hash : 'xxxxx' // user access hash
   *  })
   * ```
   */
  async getFullUserInfo(user) {
    return await this.mtproto.call('users.getFullUser', {
      id: {
        _: 'inputPeerUser',
        user_id: user.id,
        access_hash: user.access_hash,
      },
    });
  }
  /**
   * Update Current Logged In User To Online
   */
  async updateStatusToOnline() {
    await this.mtproto.call('account.updateStatus', {
      offline: false,
    });
  }
  /**
   *
   * @returns {Promise}
   */
  async getNearestDc() {
    return await this.mtproto.call('help.getNearestDc');
  }
  async setNearestDc(dc) {
    return await this.mtproto.setDefaultDc(dc)
  }

  /**
     * 
     * @param {Number|string} phone -  phone Number with international standard ex +92xxxxxxxxxx
     * @returns {Object} - if success returns phone_code_hash used when verifying OTP code
     * @Example 
     * ```
     *  const phoneNumber = '+92xxxxxxx...'
     *  const api = new Api(mtproto)
     *  const { phone_code_hash }  = await api.SignInWithPhoneNumber(phoneNumber)
     *  //code is recieved in telegram pass that here
     *  const response = api.VerifyCode(phoneNumber , code , phone_code_hash )
     *   //you are logged in now
     *   console.log(response)
     ```
     */
  async SignInWithPhoneNumber(phone = null) {
    if (!phone) {
      return new Error('Please Enter Phone Number');
    }
    return await this.mtproto.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }
  /**
   *
   * @param {Number|string} phone_number - phone Number with international standard ex +92xxxxxxxxxx
   * @param {Number|string} code - Code recieved from telegram
   * @param {string} phone_code_hash  - phone_code_hash obtained from SignInWithPhoneNumber method
   * @returns
   */
  async VerifyCode(phone_number = null, code = null, phone_code_hash = null) {
    if (!phone_number) {
      return new Error('Please Enter Phone Number');
    }
    if (!code) {
      return new Error('Please Enter code');
    }
    if (!phone_code_hash) {
      return new Error('Please Enter phone_code_hash');
    }
    return await this.mtproto.call('auth.signIn', {
      phone_code: code,
      phone_number: phone_number,
      phone_code_hash: phone_code_hash,
    });
  }

  /**
   *
   * @param {string} password
   * @returns
   */
  async VerifyPassword(password = null) {
    if (!password) {
      return new Error('Please Provide a Password Parameter');
    }
    const { srp_id, current_algo, srp_B } = await this.mtproto.call(
      'account.getPassword'
    );
    const { g, p, salt1, salt2 } = current_algo;

    console.log('account.getPassword');

    const { A, M1 } = await this.mtproto.crypto.getSRPParams({
      g,
      p,
      salt1,
      salt2,
      gB: srp_B,
      password,
    });

    const checkPasswordResult = await this.mtproto.call('auth.checkPassword', {
      password: {
        _: 'inputCheckPasswordSRP',
        srp_id,
        A,
        M1,
      },
    });

    return checkPasswordResult;
  }
  async signUp(phone, phone_code_hash, first_name, last_name) {
    return await this.mtproto.call('auth.signUp', {
      phone_number: phone,
      phone_code_hash: phone_code_hash,
      first_name,
      last_name,
    });
  }
  /**
     * 
     * @param {Number|string} profileId - profile id can be obtained from getMe() method 
     * @returns {string} - returns base64 Image
     * 
     * @Example
     *  ```
     * 
     *  const api = new Api(Mtproto)
     * 
     *  const profile = await api.getMe();
     * 
     *  const profileBase64Image = await api.getProfilePhoto(profile.full_user.profile_photo.id);
     * 
     *  //or to get profile image of a user from chat channel Messages etc 
     *  api.getProfilePhoto(chat?.profile?.photo_id , {
                _ : 'inputPeerUser',
                user_id : chat.from_id.user_id,
                access_hash : chat.access_hash
            }).then(res =>{
                console.log(res)
            }).catch(err =>{
                console.log(err)
            })
     *  ```
     */
  async getProfilePhoto(profileId, peer = null) {
    const profile_photo = await this.mtproto.call('upload.getFile', {
      location: {
        _: 'inputPeerPhotoFileLocation',
        peer: peer
          ? peer
          : {
            _: 'inputPeerSelf',
          },
        photo_id: profileId,
      },
      offset: 0,
      limit: 1024 * 1024,
    });
    const base64 = 'data:image/jpeg;base64,' +
      Buffer.from(profile_photo.bytes).toString('base64')
    return base64;
  }
  /**
   *
   * @param {Number} limit - default value 15
   * @param {Boolean} includePinned - pass true or false
   * @param {Number} offset_date  - default 0  , pass Chat Message Unix TimeStamp
   * @return {Object} - returns Chat Object
   *
   * @Example
   *  ```
   * const myChats = await Api.getChatHistory(20);
   *  // load more chats after 20
   *
   * const MoreChats = await Api.getChatHistory(20 , false , myChats.processedChats.slice(-1)[0].dateSeconds );
   * ```
   */
  async getChatHistory(limit = 15, includePinned = false, offset_date = 0) {
    const dialogs = await this.mtproto.call('messages.getDialogs', {
      offset_peer: {
        _: 'inputPeerEmpty',
      },
      exclude_pinned: true,
      limit,
      offset_date,
    });
    if (includePinned) {
      console.log('Entered Pinned');
      const pinned = await this.mtproto.call('messages.getPinnedDialogs', {
        folder_id: 0,
      });

      console.log('Pinned Data', pinned);
      dialogs.dialogs = [...pinned.dialogs, ...dialogs.dialogs];
      dialogs.chats = [...pinned.chats, ...dialogs.chats];
      dialogs.messages = [...pinned.messages, ...dialogs.messages];
      dialogs.users = [...pinned.users, ...dialogs.users];
    }

    const peers = {
      peerUser: 'user_id',
      peerChat: 'chat_id',
      peerChannel: 'channel_id',
    };

    const inputPeers = {
      peerUser: 'inputPeerUser',
      peerChat: 'inputPeerChat',
      peerChannel: 'inputPeerChannel',
    };

    const messageActions = {
      messageActionChatEditTitle: 'Changed group name', // updateNewChannelMessage - updates
      messageActionChatEditPhoto: 'Updated group photo',
      messageActionChatDeletePhoto: 'Removed group photo',
      messageActionContactSignUp: 'Joined Telegram', // updateNewMessage - updates
      messageActionPhoneCall: 'Phone call',
    };
    const chats = [];

    console.log(dialogs)
    for (const dialog of dialogs.dialogs) {
      const peer = peers[dialog.peer._];
      const dialogPeer = dialog.peer[peer];
      const inputPeer = inputPeers[dialog.peer._];
      const userPeer = peer === 'user_id';

      const chat = dialogs.chats.find((chat) => chat.id === dialogPeer);
      const message = dialogs.messages.find(
        (message) => message.peer_id[peer] === dialogPeer
      );
      const user = dialogs.users.find(
        (user) => user.id === (userPeer ? dialogPeer : message.from_id?.user_id)
      );

      if (
        message._ === 'messageService' &&
        message.action._ === 'messageActionChatMigrateTo'
      ) {
        continue;
      }
      const _message_ = {
        // With conditions
        inputPeer,
        peer,
        id: userPeer ? user.id : chat.id,
        accessHash: userPeer ? user.access_hash : chat.access_hash,
        title: userPeer
          ? user.self
            ? 'Saved messages'
            : `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
          : chat.title,
        verified: userPeer ? user.verified : chat.verified,
        photo: await this.getChatPhoto(inputPeer, userPeer ? user : chat),
        // photo : '',
        avatarTitle: Util.getAvatarTitle(
          userPeer ? user.first_name : chat.title
        ),
        avatarColor: Util.getAvatarColor(userPeer ? user.id : chat.id),
        // Shared
        message: message?.message,
        messageId: message?.id,
        messageFrom: chat && user?.first_name,
        messageService: messageActions[message?.action?._],
        media: Util.getMediaType(message),
        self: !chat && user?.self,
        out: !chat?.broadcast && message.out,
        unreadCount: dialog?.unread_count,
        read: dialog?.read_outbox_max_id === dialog.top_message,
        pinned: dialog?.pinned,
        muted: dialog?.notify_settings?.mute_until,
        date: Util.showElapsedTime(new Date(message.date).valueOf()),
        dateSeconds: message?.date,
        online:
          !chat &&
          !user?.self &&
          !user?.bot &&
          user?.status?._ === 'userStatusOnline',
        typing: false,
      };
      chats.push(_message_);
    }
    return {
      processedChats: chats,
      raw: dialogs,
    };
  }
  /**
   *
   * @param {'photo' | 'document'} type
   * @param {string} id - file ID
   * @param {string} accessHash - file access_hash
   * @param {Array<Number>} fileReference - fileRefrence Array
   * @param {'s' | 'm' | 'x' | 'y' | 'w' | 'a' | 'b' | 'c' | 'd' ?} photoSizeID - photo size can be 'm' 'y' 's' 'x' where
   * 's' is small [100x100] 'm' is [320x320] 'x' is [800x800] 'y' is [1280x1280]
   * @param {Function?} cb - Callback for file progress
   * @param {Number?} dc_id - dc_id
   * @returns {string} - returns base64 String
   *
   * @Example
   * ```
   *   //for image
   *   downloadFile('photo' ,
   *   chatFile?.media?.photo?.id ,
   *   chatFile?.media?.photo?.access_hash ,
   *   chatFile?.media?.photo?.file_reference ,
   *   'y',
   *   (prog)=>{...},
   *   dc_id // pass if you know
   *   )
   * ```
   */
  async downloadFile(
    type,
    id,
    accessHash,
    fileReference,
    photoSizeID = null,
    cb = () => { },
    dc_id = 4
  ) {
    const partSize = 524288 * 2;
    /**
     * @type {Number|undefined}
     */
    let dcId = dc_id;
    /**
     *
     * @param {Number} offset
     * @returns
     */
    const downloadPart = async (offset) => {
      const body = {
        location:
          type === 'photo'
            ? {
              _: 'inputPhotoFileLocation',
              id,
              access_hash: accessHash,
              file_reference: fileReference,
              thumb_size: photoSizeID,
            }
            : {
              _: 'inputDocumentFileLocation',
              id,
              access_hash: accessHash,
              file_reference: fileReference,
            },
        offset: offset,
        limit: partSize,
      };
      const file = await this.mtproto.call(
        'upload.getFile',
        body,
        dcId && { dcId }
      );
      return file;
    };

    let partBytesLength;
    let iter = 0;
    const fileChunks = [];
    while (partBytesLength === undefined || partBytesLength === partSize) {
      console.log('Downloading part of file', iter, iter * partSize);
      let file;
      try {
        file = await downloadPart(iter * partSize);
      } catch (e) {
        console.log(e);
        if (
          e._ === 'mt_rpc_error' &&
          e.error_message.startsWith('FILE_MIGRATE_')
        ) {
          const _dcId = Number(
            e.error_message.substring('FILE_MIGRATE_'.length)
          );
          dcId = _dcId;
          continue;
        } else {
          throw e;
        }
      }
      partBytesLength = file.bytes.length;
      console.log(
        'Downloaded part of file',
        iter,
        iter * partSize,
        partBytesLength
      );
      cb({
        part: iter,
        downloaded_till_now: iter * partSize,
        response: file,
      });
      fileChunks.push(file.bytes);
      iter++;
    }
    const fileChunksBuffers = fileChunks.map((chunk) => Buffer.from(chunk));
    const fileBuffer = Buffer.concat(fileChunksBuffers);

    const Base64 = fileBuffer.toString('base64');

    return Base64;
  }
  /**
   * @typedef {Object} uploadPart
   * @property {number} id
   * @property {number} parts
   */
  /**
   *
   * @param {Buffer} fileBuffer -Buffer Array
   * @returns {uploadPart} - Returns Object With File id and parts Count
   */
  async uploadFile(fileBuffer) {
    const partsSizes = [
      1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288,
    ];

    const debug = false;
    const fileID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    console.log('Uploading Started');
    const imageSize = Buffer.byteLength(fileBuffer);
    const maxPartSize = partsSizes[partsSizes.length - 1];
    const minPartSize = partsSizes.find((size) => imageSize <= size);
    const partContentMaxSize =
      imageSize >= maxPartSize ? maxPartSize : minPartSize;
    const chunks = Math.ceil(imageSize / partContentMaxSize);
    for (let i = 0; i < chunks; i++) {
      const partSize =
        i === chunks - 1 ? imageSize % partContentMaxSize : partContentMaxSize;
      const part = fileBuffer.subarray(
        i * partContentMaxSize,
        i * partContentMaxSize + partSize
      );
      await this.mtproto.call('upload.saveFilePart', {
        file_id: fileID,
        file_part: i,
        bytes: part,
      });
    }
    debug && console.log('Uploaded file', fileID);
    return { id: fileID, parts: chunks };
  }
  /**
   *
   * @param {string|Number} channel_id
   * @param {string} channel_access_hash
   * @returns {Array|Object}
   */
  async getChannelInfo(channel_id, channel_access_hash) {
    return await this.mtproto.call('channels.getFullChannel', {
      channel: {
        _: 'inputChannel',
        channel_id: channel_id,
        access_hash: channel_access_hash,
      },
    });
  }
  /**
   * @typedef PeerType
   * @property {Number} user_id
   * @property {string} _
   */

  /**
   *  @typedef MessageType
   *  @property {Number} date
   *  @property {Number} id
   *  @property {Boolean} edit_hide
   *  @property {Boolean} legacy
   *  @property {Boolean} media_unread
   *  @property {Boolean} mentioned
   *  @property {Number} flags
   *  @property {Boolean} from_scheduled
   *  @property {Boolean} noforwards
   *  @property {Boolean} pinned
   *  @property {Boolean} post
   *  @property {Boolean} silent
   *  @property {string} message
   *  @property {string} _
   *  @property {Object} media
   *  @property {PeerType} peer_id
   */

  /**
   * @typedef Chat
   * @property {string} inputPeer
   * @property {Number|string} id
   * @property {string} accessHash
   */

  /**
   * @typedef {Object} ReturnType
   * @property {Array<MessageType>} messages
   * @property {Array} users
   * @property {Number} offset
   */

  /**
   *
   * @param {Chat} chat  - chat Object should Contain chat.id , chat.inputPeer , chat.peer , chat.accessHash
   * @param {Number} limit - default Limit 100
   * @param {Number?} offset - default null
   * @returns {ReturnType}
   *
   *
   */
  async getChats(chat, limit = 100, offset = null) {
    const HistoryResult = await this.mtproto.call('messages.getHistory', {
      peer: {
        _: chat.inputPeer,
        [chat.peer]: chat.id,
        access_hash: chat.accessHash,
      },
      limit,
      add_offset: offset,
    });
    return {
      messages: this.MergedResult(HistoryResult),
      users: HistoryResult.users,
      offset: offset
        ? offset + HistoryResult.messages.length
        : HistoryResult.messages.length,
    };
  }
  /**
   *
   * @param {Chat} chat - chat Object should Contain chat.id , chat.inputPeer , chat.peer
   * @param {string} inputMessage - Message String
   * @param {Array} entities
   * @returns
   */
  async sendTextMessage(chat, inputMessage, entities = []) {
    return await this.mtproto.call('messages.sendMessage', {
      random_id: Util.generateRandomId(),
      message: inputMessage,
      entities: entities,
      peer: {
        _: chat.inputPeer,
        [chat.peer]: chat.id,
      },
    });
  }
  /**
   * @typedef {Object} FileType
   * @property {Number} id
   * @property {Number} parts
   * @property {Number} size
   * @property {string} mime_type
   * @property {string} name
   */
  /**
   *
   * @param {Chat} chat
   * @param {FileType} file
   * @param {string} message
   */
  async sendMediaMessage(chat, file, message) {
    try {
      const upl_media = await this.mtproto.call('messages.uploadMedia', {
        random_id: Util.generateRandomId(),
        media: {
          _: 'inputMediaUploadedDocument',
          file: {
            _: 'inputFile',
            id: file.id,
            parts: file.parts,
            name: file.name,
            md5_checksum: '',
          },
          mime_type: file.mime_type,
          attributes: [
            {
              _: 'documentAttributeFilename',
              file_name: file.name,
            },
          ],
        },
        peer: {
          _: chat.inputPeer,
          [chat.peer]: chat.id,
        },
      });
      console.log(upl_media);
      return await this.mtproto.call('messages.sendMultiMedia', {
        peer: {
          _: chat.inputPeer,
          [chat.peer]: chat.id,
        },
        multi_media: [
          {
            _: 'inputSingleMedia',
            random_id: Util.generateRandomId(),
            message: message,
            entities: [],
            media: {
              _: 'inputMediaDocument',
              id: {
                _: 'inputDocument',
                id: upl_media.document.id,
                access_hash: upl_media.document.access_hash,
                file_reference: upl_media.document.file_reference,
              },
            },
          },
        ],
      });
    } catch (error) {
      return new Error(error);
    }
  }
  /**
   *
   * @param {Array<Number>} messageIds - pass Message Ids ex: [msgID1,msgID2]
   * @returns {Promise}
   */
  async deleteMessages(messageIds) {
    return await this.mtproto.call('messages.deleteMessages', {
      revoke: true,
      id: messageIds,
    });
  }
  /**
   *
   * @param {Chat} chat
   * @param {Number|string} maxId - pass Latest Recieved Message Id or greater
   * @return {Promise}
   */
  async SetMessagesAsSeen(chat, maxId) {
    return await this.mtproto.call('messages.readHistory', {
      peer: {
        _: chat.inputPeer,
        [chat.peer]: chat.id,
        access_hash: chat.accessHash,
      },
      maxId: maxId,
    });
  }
  /**
   *
   * @private
   */
  MergedResult(chat) {
    let Messages = [];
    let chatMessageLength = chat.messages.length;
    for (let i = 0; i < chatMessageLength; i++) {
      const element = chat.messages[i];
      const _user = chat.users.find(
        (user) => user.id === element?.from_id?.user_id
      );
      const _msg = {
        ...element,
        first_name: _user?.first_name ?? '',
        last_name: _user?.last_name ?? '',
        premium: _user?.premium ?? '',
        contact: _user?.contact ?? '',
        bot: _user?.bot ?? false,
        profile: _user?.photo ?? {},
        username: _user?.username ?? '',
        verified: _user?.verified ?? false,
        status: _user?.status ?? {},
        self: _user?.self ?? false,
        access_hash: _user?.access_hash ?? '',
      };

      Messages.push(_msg);
    }
    return Messages;
  }

  /**
   *
   * @private
   */
  async getChatPhoto(inputPeer, peer) {
    if (
      !peer.photo ||
      (peer.photo._ !== 'userProfilePhoto' && peer.photo._ !== 'chatPhoto')
    ) {
      return '';
    }
    try {

      const photo = await this.mtproto.call(
        'upload.getFile',
        {
          location: {
            _: 'inputPeerPhotoFileLocation',
            peer: {
              _: inputPeer,
              [`${inputPeer.slice(9).toLowerCase()}_id`]: peer.id,
              access_hash: peer.access_hash,
            },
            photo_id: peer.photo.photo_id,
          },
          offset: 0,
          limit: 32768,
        },
        {
          dcId: peer.photo.dc_id,
        }
      );

      const base64 = Buffer.from(photo.bytes).toString('base64');

      return 'data:image/jpeg;base64,' + base64;
    } catch (error) {
      console.log(error)
      return ''
    }
  }
}

export default Api;
