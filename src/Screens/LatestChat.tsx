import React, {useState, useEffect} from 'react';
import {View, ImageBackground} from 'react-native';
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
import {NativeStackScreenProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import {AllNavList} from '../Routes';
import database from '@react-native-firebase/database';
import base64 from 'react-native-base64';
import uuid from 'react-native-uuid';

type Props = NativeStackScreenProps<AllNavList, 'LatestChat'>;

export default function LatestChat({route, navigation}: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const {from, to, title, senderName} = route.params;

  const fromEmail = base64.encode(from);
  const toEmail = base64.encode(to);

  useEffect(() => {
    settingItTrue();
    const subs = getAllMsgs();
    return () => subs?.off('value');
  }, []);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', e => {
      settingItTrue();
    });
    return sub;
  }, [navigation]);

  const settingItTrue = async () => {
    try {
      await database()
        .ref(`/user_conversations/${fromEmail}/${toEmail}`)
        .once('value')
        .then(snap => {
          if (snap.val()) {
            database()
              .ref(`/user_conversations/${fromEmail}/${toEmail}`)
              .update({receiverHasRead: true, unreadCount: 0});
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getAllMsgs = () => {
    try {
      const dbRef = database().ref(`/messages/${fromEmail}/${toEmail}`);
      dbRef.on('value', snapshot => {
        if (snapshot) {
          let tempArr: any = [];
          snapshot.forEach(singleMsg => {
            if (singleMsg) {
              tempArr.push({
                ...singleMsg.val(),
                createdAt: new Date(singleMsg.val().createdAt),
                _id: uuid.v4(),
                user: {
                  _id: singleMsg.val().type == 'send' ? fromEmail : toEmail,
                },
              });
            }
            return undefined;
          });
          tempArr.sort(function (
            a: {createdAt: number},
            b: {createdAt: number},
          ) {
            return b.createdAt - a.createdAt;
          });

          setMessages(tempArr);
        }
      });
      return dbRef;
    } catch (error) {
      console.log('fetchMsg ---->', error);
    }
  };

  const onSend = (msg: any[]) => {
    const fMsg = msg[0];
    let dateToSend = new Date().getTime();
    setMessages(previousMessages => GiftedChat.append(previousMessages, fMsg));
    try {
      let count = 0;
      database()
        .ref(`/messages/${fromEmail}/${toEmail}`)
        .push({text: fMsg.text, createdAt: dateToSend, type: 'send'});

      database().ref(`/messages/${toEmail}/${fromEmail}`).push({
        text: fMsg.text,
        createdAt: dateToSend,
        type: 'receive',
      });

      database().ref(`/user_conversations/${fromEmail}/${toEmail}`).set({
        createdAt: dateToSend,
        email: to,
        lastMsg: fMsg.text,
        name: title,
        receiverHasRead: true,
        unreadCount: 0,
      });
      database()
        .ref(`/user_conversations/${toEmail}/${fromEmail}`)
        .once('value')
        .then(snap => {
          if (snap.val()) {
            count = snap.val().unreadCount;
          } else {
            count = 0;
          }
          database()
            .ref(`/user_conversations/${toEmail}/${fromEmail}`)
            .set({
              createdAt: dateToSend,
              email: from,
              lastMsg: fMsg.text,
              name: senderName,
              receiverHasRead: false,
              unreadCount: count + 1,
            });
        });
    } catch (er) {
      console.log('onsending msg: ', er);
    }
  };

  return (
    <View style={{flex: 1}}>
      <ImageBackground
        source={require('../../assets/back.jpg')}
        style={{flex: 1, justifyContent: 'center'}}>
        <GiftedChat
          messages={messages}
          onSend={msg => onSend(msg)}
          user={{
            _id: fromEmail,
          }}
          renderAvatar={null}
          renderBubble={props => {
            return (
              <Bubble
                {...props}
                textStyle={{
                  right: {color: 'white'},
                  left: {color: 'black'},
                }}
                wrapperStyle={{
                  right: {backgroundColor: '#1434A4'},
                  left: {backgroundColor: 'white'},
                }}
              />
            );
          }}
          renderInputToolbar={props => {
            return (
              <InputToolbar
                {...props}
                containerStyle={{borderTopWidth: 1.5, borderTopColor: 'green'}}
              />
            );
          }}
        />
      </ImageBackground>
    </View>
  );
}
