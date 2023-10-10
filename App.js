import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto, MaterialIcons   } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos"


export default function App() {

  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const onEditText = (payload) =>  setEditText(payload);

  const saveToDos = async(toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }

  const loadToDos = async() => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    s !== null ? setToDos(JSON.parse(s)) : null;
  }

  useEffect(() => {
    loadToDos();
  }, []);

  const addToDo = async() => {
    if(text === '') { return }
    const newToDos = {...toDos, [Date.now()] : {text, work:working, completed:false, isEdit:false}}
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }


  const deleteToDo = async(key) => {
    Alert.alert(
      "Delete To Do?", 
      "Are you sure?", [
      { text : "Cancel" },
      { 
        text : "I'm Sure", 
        onPress : () => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
        style : 'destructive'
      },
    ])
  }

  const completeToDo = (key)=>{
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
  }

  const isEditMode = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].isEdit = !newToDos[key].isEdit;
    setToDos(newToDos);
  }


  const editToDo = async(key) => {
    if(editText === '') { return } 
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    newToDos[key].isEdit = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.5} onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white" : theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onPress={travel}>
          <Text style={{...styles.btnText, color : !working ? "white" : theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput 
          onSubmitEditing={addToDo}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"} 
          value={text}
          style={styles.input}
          returnKeyType='done'
          onChangeText={onChangeText}
        />
      </View>
      <ScrollView>
      {
        Object.keys(toDos).map(key => 
        toDos[key].work === working ? 
          (
            <View 
              key={key} 
              style={toDos[key].completed ? styles.completed : styles.toDo}
            >
              <View style={styles.textArea}>
                <TouchableOpacity onPress={()=>{completeToDo(key)}} activeOpacity={0.5}>
                  <Fontisto name={toDos[key].completed ? "checkbox-active" : "checkbox-passive"} size={24} color={theme.gray} />
                </TouchableOpacity>
                {
                  toDos[key].isEdit === true ? 
                  <TextInput 
                    onSubmitEditing={()=> editToDo(key)}
                    placeholder={toDos[key].text}
                    value={editText}
                    style={styles.editInput}
                    returnKeyType='done'
                    onChangeText={onEditText}
                  />
                  :
                  <Text
                    style={toDos[key].completed ? styles.comText : styles.toDoText}
                  >{toDos[key].text}</Text>
                }
              </View>
              <View style={styles.btnArea}>
                { !toDos[key].completed &&
                  <TouchableOpacity 
                    onPress={()=>{isEditMode(key)}} 
                    activeOpacity={0.5} 
                    style={{marginRight:10}}
                  >
                    <MaterialIcons name="mode-edit" size={18} color={theme.gray} />
                  </TouchableOpacity>
                }
                <TouchableOpacity onPress={()=>{deleteToDo(key)}} activeOpacity={0.5}>
                  <Fontisto name="trash" size={18} color={theme.gray} />
                </TouchableOpacity>
              </View>
            </View> 
          )
          : null
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header : {
    justifyContent: "space-between",
    flexDirection : "row",
    marginTop: 100,
  },
  btnText : {
    fontSize: 38,
    fontWeight: "500",
  },
  input : {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize : 18
  },
  editInput : {
    marginLeft: 10,
    color:"white",
    fontSize : 16,
    fontWeight: "500",
  },
  toDo: {
    flexDirection: "row",
    justifyContent : "space-between",
    alignItems : "center",
    marginBottom : 10,
    paddingVertical : 20,
    paddingHorizontal : 20,
    backgroundColor : theme.toDoBg,
    borderRadius: 15,
  },
  completed : {
    flexDirection: "row",
    justifyContent : "space-between",
    alignItems : "center",
    marginLeft : 50,
    marginBottom : 10,
    paddingVertical : 20,
    paddingHorizontal : 20,
    backgroundColor : theme.comBg,
    borderRadius: 15,
  },
  toDoText : {
    marginLeft:10,
    color:"white",
    fontSize : 16,
    fontWeight: "500",
  },
  comText : {
    marginLeft:10,
    color: theme.comText,
    fontSize : 16,
    fontWeight: "500",
    textDecorationLine : "line-through",
  },
  textArea : {
    flexDirection: "row",
    justifyContent : "flex-start",
    alignItems : "center",
  },
  btnArea : {
    flexDirection: "row",
    justifyContent : "space-between",
    alignItems : "center",
  }
});
