import React, { Component } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button
} from 'react-native';

import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
  ChannelProfile,
  ClientRole,
  DataStreamConfig,
  RtcEngineContext,
 
} from 'react-native-agora';

// import Icon from 'react-native-vector-icons/Feather'

// import axios from 'axios';

import requestCameraAndAudioPermission from './Permission';
import styles from './Styles';

interface Props { }

/**
 * @property peerIds Array for storing connected peers
 * @property appId
 * @property channelName Channel Name for the current session
 * @property joinSucceed State variable for storing success
 */
interface State {
  appId: string;
  token: string;
  channelName: string;
  joinSucceed: boolean;
  peerIds: number[];
  certificate: string;
  uid: number;
  isVideoOn: boolean;
  isVoiceOn: boolean;
  isMicOn: boolean;
  ttoken: string;
  tuid: number;
  message?: string;
}

export default class callScreen extends Component<Props, State> {
  _engine?: RtcEngine;


  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      appId: '64fe1ef89dce4dd9bb88f83e344efbb2',
      token: '',
      tuid: 0,
      uid: 0,
      ttoken: '00664fe1ef89dce4dd9bb88f83e344efbb2IAAHbFXzr8PCccUX/f6chi/yzmxuylDImdUwMA5ffG9WgQx+f9gAAAAAEAB1Kdkmez9iYgEAAQB+P2Ji',
      channelName: 'test',
      joinSucceed: false,
      peerIds: [],
      certificate: '5cb9d346317b4329abaef45881b58827',
      isVideoOn: true,
      isVoiceOn: true,
      isMicOn: true,
      // message:''
    };
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }

  componentDidMount() {
    this.init();
  }
  _renderToolBar = () => {
    const { message } = this.state;
    return (
      <View>
        <Text style={styles.toolBarTitle}>Send Message</Text>
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.setState({ message: text })}
            placeholder={'Input Message'}
            value={message}
          />
          {/* <Button title="Send" onPress={this._onPressSend} /> */}
        </View>
      </View>
    );
  };

  /**
   * @name init
   * @description Function to initialize the Rtc Engine, attach event listeners and actions
   */
  init = async () => {
    const { appId } = this.state;
    this._engine = await RtcEngine.create(appId);
    await this._engine.enableVideo();

    this._engine.addListener('Warning', (warn) => {
      console.log('Warning', warn);
    });

    this._engine.addListener('Error', (err) => {
      console.log('Error', err);
    });

    this._engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      // Get current peer IDs
      const { peerIds } = this.state;
      // If new user
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          // Add peer ID to state array
          peerIds: [...peerIds, uid],
        });
      }
    });

    this._engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      const { peerIds } = this.state;
      this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter((id) => id !== uid),
      });
    });

    // If Local user joins RTC channel
    this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      // Set state variable to true
      this.setState({
        joinSucceed: true,
      });
    });
  };

  startCall = async (token: string, uid: number) => {
    // Join Channel using null token and channel name
    console.log(token, uid)
    let channelOptions = {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
    };
    await this._engine?.joinChannel(
      token,
      this.state.channelName,
      null,
      uid,
      channelOptions
    );
  };

  endCall = async () => {
    await this._engine?.leaveChannel();
    this.setState({ peerIds: [], joinSucceed: false });
    console.log('end call')
  };

  disableVideo = async () => {
    await this._engine?.enableLocalVideo(false);
    console.log('disableVideo')
    this.setState({ isVideoOn: false });
  };

  enableVideo = async () => {
    await this._engine?.enableLocalVideo(true);
    console.log('enableVideo')
    this.setState({ isVideoOn: true });
  };

  disableVoice = async () => {
    await this._engine?.enableLocalAudio(false);
    console.log('disableMic')
    this.setState({ isVoiceOn: false });
  };

  enableVoice = async () => {
    await this._engine?.enableLocalAudio(true);
    console.log('enableMic')
    this.setState({ isVoiceOn: true });
  };

  disableSpeaker = async () => {
    await this._engine?.setEnableSpeakerphone(false);
    console.log('enableAudio')
    this.setState({ isMicOn: false });
  };

  enableSpeaker = async () => {
    await this._engine?.setEnableSpeakerphone(true);
    console.log('enableAudio')
    this.setState({ isMicOn: true });
  };
  Meesage = async () => {

    this._engine?.addListener('StreamMessage', (uid, streamId, data) => {
      console.info('UserOffline', uid, streamId, data);
      console.log(`Receive from uid:${uid}`, `StreamId ${streamId}:${data}`, [
        {
          text: 'Ok',
          onPress: () => { },
        },
      ]);
    });
    this._engine?.addListener(
      'StreamMessageError',
      (uid, streamId, error, missed, cached) => {
        console.info(
          'StreamMessageError',
          uid,
          streamId,
          error,
          missed,
          cached
        );
      }
    );
  }


  //   getToken = () => {
  //     let that = this;
  //     let data = {
  //       token: '',
  //       uid: 0
  //     }
  //     axios.post('https://zoom-url-call.herokuapp.com/get_rtc_token', this.state)
  //     .then(function (response) {
  //       data.token = response.data.token
  //       data.uid = response.data.uid
  //       that.setState({
  //         token: data.token,
  //         uid: data.uid
  //       })
  //       that.startCall(data.token , data.uid)
  //     })
  //     console.log(data.token , data.uid)
  //   }

  destroy = async () => {
    await this._engine?.destroy();
  };

  render() {
    const { joinSucceed } = this.state;
    let buttonCall;

    buttonCall = <TouchableOpacity onPress={() => this.startCall(this.state.ttoken, this.state.tuid)} style={styles.button_call}>
      {/* <Icon name="phone-call" size={20} color="#fff" />
                 */}
      <Text >Phone call</Text>
    </TouchableOpacity>;
    return (
      <View style={styles.max}>
        <View style={styles.max}>
          <View style={styles.buttonHolder}>
            {buttonCall}
          </View>
          {this._renderVideos()}
        </View>
      </View>
    );
  }

  _renderVideos = () => {
    const { joinSucceed } = this.state;
    let buttonCall = <TouchableOpacity onPress={this.endCall} style={styles.button_call_end}>
      {/* <Icon name="phone-off" size={20} color="#fff" /> */}
      <Text style={{ color: "#fff" }}>Phone off</Text>

    </TouchableOpacity>;

    const isVideoOn = this.state.isVideoOn;
    let buttonVideo;
    if (isVideoOn) {
      buttonVideo = <TouchableOpacity onPress={this.disableVideo} style={styles.buttonControll}>
        {/* <Icon name="video" size={20} color="#fff" /> */}
        <Text style={{ color: "#fff" }}>Video</Text>

      </TouchableOpacity>;
    } else {
      buttonVideo = <TouchableOpacity onPress={this.enableVideo} style={styles.buttonControll}>
        {/* <Icon name="video-off" size={20} color="#fff" /> */}
        <Text style={{ color: "#fff" }}>Phone off</Text>

      </TouchableOpacity>;
    }

    const isVoiceOn = this.state.isVoiceOn;
    let buttonVoice;
    if (isVoiceOn) {
      buttonVoice = <TouchableOpacity onPress={this.disableVoice} style={styles.buttonControll}>
        {/* <Icon name="mic" size={20} color="#fff" />
                   */}
        <Text style={{ color: "#fff" }}>mic</Text>

      </TouchableOpacity>
    } else {
      buttonVoice = <TouchableOpacity onPress={this.enableVoice} style={styles.buttonControll}>
        {/* <Icon name="mic-off" size={20} color="#fff" />
                 */}
        <Text style={{ color: "#fff" }}>mic off</Text>

      </TouchableOpacity>
    }

    const isMicOn = this.state.isMicOn;
    let buttonMic;
    if (isMicOn) {
      buttonMic = <TouchableOpacity onPress={this.disableSpeaker} style={styles.buttonControll}>
        {/* <Icon name="volume-2" size={20} color="#fff" />
                   */}
        <Text style={{ color: "#fff" }}>Volume-disable</Text>

      </TouchableOpacity>
    } else {
      buttonMic = <TouchableOpacity onPress={this.enableSpeaker} style={styles.buttonControll}>
        {/* <Icon name="volume-x" size={20} color="#fff" />
                   */}
        <Text style={{ color: "#fff" }}>volume-enable</Text>

      </TouchableOpacity>
    }

    return joinSucceed ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={this.state.channelName}
          renderMode={VideoRenderMode.Hidden}
        />
        <View style={styles.buttonHolder}>
          {buttonCall}
        </View>
        {this._renderRemoteVideos()}
        <View style={styles.controlHolder}>
          {buttonVideo}
          {buttonVoice}
          {buttonMic}
        </View>
      </View>
    ) : null;
  };

  _renderRemoteVideos = () => {
    const { peerIds } = this.state;
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={{ paddingHorizontal: 2.5 }}
        horizontal={true}
      >
        {peerIds.map((value) => {
          return (
            <RtcRemoteView.SurfaceView
              style={styles.remote}
              uid={value}
              channelId={this.state.channelName}
              renderMode={VideoRenderMode.Hidden}
              zOrderMediaOverlay={true}
            />
          );
        })}
      </ScrollView>
    );
  };
}


