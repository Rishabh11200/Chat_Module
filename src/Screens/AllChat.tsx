import React, {useState, useEffect} from 'react';
import {
  TextStyle,
  ViewStyle,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {List, Divider, Text, Badge} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import {AllNavList} from '../Routes';
import database from '@react-native-firebase/database';
import base64 from 'react-native-base64';

type Props = NativeStackScreenProps<AllNavList, 'AllChat'>;
interface Style {
  view: ViewStyle;
  text: TextStyle;
  insideView: ViewStyle;
  listView: ViewStyle;
  loadingView: ViewStyle; 
}
function AllChat({route, navigation}: Props) {
  const name = route.params.userName;
  const [loading, setLoading] = useState<boolean>(true);
  const [oList, setOList] = useState<any[]>([]);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  useEffect(() => {
    const subs = getAllUsers();
    return () => subs?.off('value');
  }, []);

  const convertTime = (date: any) => {
    const temp = new Date(date);
    const mins = (temp.getMinutes() < 10 ? '0' : '') + temp.getMinutes();
    const edited = temp.getHours() + ':' + mins;
    return edited;
  };
  const convertDate = (date: any) => {
    const temp = new Date(date);
    const edited =
      temp.getDate() + '/' + (temp.getMonth() + 1) + '/' + temp.getFullYear();
    return edited;
  };
  const getAllUsers = () => {
    const userEmail = base64.encode(name.email);
    try {
      const dbRef = database().ref(`/user_conversations/${userEmail}`);
      dbRef.on('value', snapshot => {
        let temp: any = [];
        let value: any;
        if (snapshot.val() != null && snapshot.val() != undefined) {
          for (value of Object.values(snapshot.val())) {
            temp.push({
              name: value.name,
              email: value.email,
              Id: value.Id,
              lastMsg: value.lastMsg,
              cre: value.createdAt,
              readStatus: value.receiverHasRead,
              unread: value.unreadCount,
            });
          }
          temp.sort(function (a: {cre: number}, b: {cre: number}) {
            return b.cre - a.cre;
          });
          setOList(temp);
          setLoading(false);
        } else {
          setOList([]);
          setLoading(false);
        }
      });

      return dbRef;
    } catch (err) {
      console.log(err);
    }
  };
  const toChat = (email: any, toName: any) => {
    navigation.navigate('LatestChat', {
      from: name.email,
      to: email,
      title: toName,
      senderName: name.Name,
    });
  };
  const renderSingle = (index: any) => {
    let TimeStamp: {} | null | undefined;
    const userDate = new Date(oList[index].cre);
    let isToday =
      today.getDate() == userDate.getDate() &&
      today.getMonth() == userDate.getMonth() &&
      today.getFullYear() == userDate.getFullYear()
        ? true
        : false;
    let isYesterday =
      yesterday.getDate() == userDate.getDate() &&
      yesterday.getMonth() == userDate.getMonth() &&
      yesterday.getFullYear() == userDate.getFullYear()
        ? true
        : false;
    if (isToday) {
      TimeStamp = convertTime(oList[index].cre);
    } else if (isYesterday) {
      TimeStamp = 'Yesterday';
    } else {
      TimeStamp = convertDate(oList[index].cre);
    }
    return (
      <Pressable
        onPressOut={() => {
          toChat(oList[index].email, oList[index].name);
        }}>
        <List.Item
          title={oList[index].name}
          titleStyle={{fontSize: 20, color: 'black'}}
          description={oList[index].lastMsg}
          right={props => {
            return (
              <View>
                <Text {...props}>{TimeStamp}</Text>
                {!oList[index].readStatus ? (
                  <Badge style={{backgroundColor: '#39FF14'}} size={25}>
                    {oList[index].unread}
                  </Badge>
                ) : null}
              </View>
            );
          }}
        />
      </Pressable>
    );
  };
  return (
    <>
      {loading ? (
        <View style={styles.loadingView}>
          <ActivityIndicator size={'large'} color={'#008b8b'} />
          <Text style={styles.text}>Please wait..</Text>
        </View>
      ) : (
        <View style={styles.view}>
          <View style={styles.insideView}>
            <FlatList
              data={Object.keys(oList)}
              ItemSeparatorComponent={() => {
                return <Divider style={{borderWidth: 0.5}} />;
              }}
              renderItem={({index}) => renderSingle(index)}
              keyExtractor={item => item}
            />
          </View>
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create<Style>({
  view: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 10,
  },
  loadingView: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: 'black',
    fontSize: 19,
  },
  insideView: {
    marginHorizontal: 4,
  },
  listView: {
    justifyContent: 'center',
    margin: 10,
    borderWidth: 1,
    borderRadius: 90,
    alignItems: 'center',
  },
});
export default AllChat;
