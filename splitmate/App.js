import React, { useState } from 'react';
import { SafeAreaView, Button, Image, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Tesseract from 'tesseract.js';

export default function App() {
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]); // {name: '', price: '', friends: []}
  const [friends, setFriends] = useState([]); // [string]
  const [newFriend, setNewFriend] = useState('');
  const [tip, setTip] = useState('0');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const ocr = await Tesseract.recognize(uri, 'eng');
      const text = ocr.data.text;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const parsed = lines.map(l => {
        const m = l.match(/(.+)\s+(\d+[\.\d]*)$/);
        if (m) return { name: m[1], price: m[2], friends: [] };
        return null;
      }).filter(x => x);
      setItems(parsed);
    }
  };

  const addFriend = () => {
    if (newFriend) {
      setFriends([...friends, newFriend]);
      setNewFriend('');
    }
  };

  const toggleItemFriend = (itemIndex, friend) => {
    const updated = [...items];
    const idx = updated[itemIndex].friends.indexOf(friend);
    if (idx >= 0) {
      updated[itemIndex].friends.splice(idx, 1);
    } else {
      updated[itemIndex].friends.push(friend);
    }
    setItems(updated);
  };

  const totals = () => {
    const friendTotals = {};
    friends.forEach(f => friendTotals[f] = 0);
    items.forEach(item => {
      if (item.friends.length === 0) return;
      const share = parseFloat(item.price) / item.friends.length;
      item.friends.forEach(f => friendTotals[f] += share);
    });
    const tipPct = parseFloat(tip) / 100;
    friends.forEach(f => friendTotals[f] += friendTotals[f] * tipPct);
    return friendTotals;
  };

  return (
    <SafeAreaView style={{flex:1, padding:20}}>
      <ScrollView>
        <Button title="Pick Receipt Image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        {items.map((item, idx) => (
          <View key={idx} style={{ marginVertical: 5 }}>
            <Text>{item.name} - ${item.price}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {friends.map(f => (
                <TouchableOpacity key={f} onPress={() => toggleItemFriend(idx, f)} style={{ margin: 2, padding: 4, backgroundColor: item.friends.includes(f) ? '#84e' : '#ccc' }}>
                  <Text>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <TextInput style={{ borderWidth:1, flex:1, marginRight:5, padding:5 }} placeholder="Add friend" value={newFriend} onChangeText={setNewFriend} />
          <Button title="Add" onPress={addFriend} />
        </View>
        <View style={{ flexDirection:'row', marginVertical:5 }}>
          <Text>Tip %: </Text>
          <TextInput style={{ borderWidth:1, flex:1, padding:5 }} keyboardType="numeric" value={tip} onChangeText={setTip} />
        </View>
        <Text style={{fontSize:18, marginTop:10}}>Totals:</Text>
        {friends.map(f => (
          <Text key={f}>{f}: ${totals()[f].toFixed(2)}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
