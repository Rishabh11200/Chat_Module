import React, {useState, useEffect} from 'react';
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  MessageText,
} from 'react-native-gifted-chat';
import {NativeStackScreenProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import {AllNavList} from '../Routes';
import firestore from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<AllNavList, 'Eg'>;

export default function Eg({route}: Props) {
  const [messages, setMessages] = useState([]);
  const {from, to} = route.params;

  useEffect(() => {
    const subs = firestore()
      .collection('Messages')
      .where('from', 'in', [from, to])
      .orderBy('createdAt', 'desc');
      
    const msgs = subs.onSnapshot(documentSnapshot => {
      if (documentSnapshot) {
        let temp: any = [];
        documentSnapshot.docs.forEach(doc => {
          if (doc.data().createdAt) {
            temp.push({
              _id: doc.data()._id,
              text: doc.data().text,
              createdAt: doc.data().createdAt.toDate(),
              to: doc.data().to,
              from: doc.data().from,
              user: doc.data().user,
            });
          } else {
            temp.push({
              _id: doc.data()._id,
              text: doc.data().text,
              createdAt: new Date(),
              to: doc.data().to,
              from: doc.data().from,
              user: doc.data().user,
            });
          }
        });
        const filtered = temp.filter(
          (item: {to: number}) => item.to == to || item.to == from,
        );
        setMessages(filtered);
      }
    });

    return () => msgs();
  }, []);

  // const onSend = useCallback((messages = []) => {
  //   setMessages(previousMessages =>
  //     GiftedChat.append(previousMessages, messages),
  //   );
  // }, []);

  function finalMsg(msg: any) {
    let temp: any = [];
    temp = {
      ...msg[0],
      to: to,
      from: from,
    };
    setMessages(previousMessages => GiftedChat.append(previousMessages, temp));
    firestore().collection('Messages').doc().set(temp);
  }
  return (
    <GiftedChat
      messages={messages}
      onSend={msg => finalMsg(msg)}
      user={{_id: from}}
      isTyping={true}
      placeholder={'Enter a message...'}
      isLoadingEarlier={true}
      scrollToBottom={true}
      renderAvatar={null}
      renderMessageText={props => {
        return (
          <MessageText
            {...props}
            textStyle={{
              left: {color: 'white'},
              right: {color: 'white'},
            }}
          />
        );
      }}
      renderInputToolbar={props => {
        return (
          <InputToolbar
            {...props}
            containerStyle={{borderTopWidth: 2, borderTopColor: 'cyan'}}
          />
        );
      }}
      renderBubble={props => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {backgroundColor: '#80400B'},
              left: {backgroundColor: 'teal'},
            }}
          />
        );
      }}
    />
  );
}
