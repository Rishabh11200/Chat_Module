import React, {useState} from 'react';
import {
  TextStyle,
  ViewStyle,
  View,
  ScrollView,
  StyleSheet,
  Keyboard,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack/lib/typescript/src/types';
import {AllNavList} from '../Routes';
import firestore from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<AllNavList, 'First'>;
interface Style {
  view: ViewStyle;
  text: TextStyle;
  heading: TextStyle;
  insideView: ViewStyle;
  modal: ViewStyle;
  centered: ViewStyle;
  textView: ViewStyle;
}

function First({navigation}: Props) {
  const [name, setName] = useState<string>('');
  const [libData, setLibData] = useState<any[]>([]);
  const [stuData, setStuData] = useState<any>({});
  const [open, setOpen] = useState(false);

  const onPressSubmit = () => {
    Keyboard.dismiss();
    try {
      firestore()
        .collection('users')
        .doc(name)
        .onSnapshot(async documentSnapshot => {
          const data = documentSnapshot.data();
          if (data && data.Role === 'lib') {
            navigation.navigate('AllChat', {userName: data});
          } else if (data && data.Role === 'stu') {
            const users = await firestore().collection('users').get();
            if (users) {
              const mapped = users.docs.map(doc => doc.data());
              const temp = mapped.filter(data => data.Role === 'lib');
              setLibData(temp);
            }
            setStuData(data);
            setOpen(true);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  const navigateWithStu = (email: string, name: string) => {
    navigation.navigate('LatestChat', {
      from: stuData.email,
      to: email,
      title: name,
      senderName: stuData.Name,
    });
    setOpen(false);
  };
  return (
    <ScrollView style={styles.view} keyboardShouldPersistTaps="handled">
      <View style={styles.insideView}>
        <Modal
          visible={open}
          onRequestClose={() => setOpen(false)}
          transparent={true}>
          <View style={styles.modal}>
            <View style={styles.centered}>
              <Text style={styles.heading}>Choose Librarian</Text>
              <FlatList
                keyboardShouldPersistTaps={'handled'}
                key={1}
                data={libData}
                keyExtractor={item => item.Id}
                renderItem={({item, index}) => {
                  return (
                    <Pressable
                      onPress={() => {
                        navigateWithStu(item.email, item.Name);
                      }}>
                      <View style={styles.textView}>
                        <Text style={styles.text}>{`${index + 1}.${
                          item.Name
                        }`}</Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        <TextInput
          label="Name"
          mode="outlined"
          value={name}
          onChangeText={text => setName(text)}
        />
        <Button
          icon="check-decagram"
          mode="outlined"
          onPress={() => {
            onPressSubmit();
          }}>
          Login
        </Button>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create<Style>({
  view: {
    backgroundColor: 'white',
    paddingTop: 10,
  },
  heading: {
    color: 'black',
    fontSize: 20,
    textDecorationLine: 'underline',
    padding: 10,
  },
  text: {
    color: 'black',
    fontSize: 18,
    padding: 10,
  },
  textView: {
    borderRadius: 50,
    borderWidth: 1,
    margin: 5,
  },
  insideView: {
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 25,
    padding: '10%',
    margin: 20,
    borderRadius: 45,
    backgroundColor: 'white',
    shadowColor: 'cyan',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
export default First;
