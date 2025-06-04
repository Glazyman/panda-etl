import React, { useState } from 'react';
import { SafeAreaView, Button, Image, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Tesseract from 'tesseract.js';

export default function App() {
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]); // {name, price, friends}
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [tax, setTax] = useState('0');
  const [tip, setTip] = useState('0');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const ocr = await Tesseract.recognize(uri, 'eng');
      const text = ocr.data.text;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const parsed = [];
      let detectedTax = 0;
      let detectedTip = 0;
      lines.forEach(l => {
        const m = l.match(/(.+)\s+(\d+(?:\.\d{1,2})?)/);
        if (!m) return;
        const name = m[1].trim();
        const price = m[2];
        if (/tax/i.test(name)) {
          detectedTax = price;
        } else if (/tip/i.test(name)) {
          detectedTip = price;
        } else if (!/total/i.test(name) && !/subtotal/i.test(name)) {
          parsed.push({ name, price, friends: [] });
        }
      });
      setItems(parsed);
      if (detectedTax) setTax(detectedTax.toString());
      if (detectedTip) setTip(detectedTip.toString());
    }
  };

  const addFriend = () => {
    if (!newFriend) return;
    setFriends([...friends, newFriend]);
    setNewFriend('');
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const toggleItemFriend = (itemIndex, friend) => {
    const updated = [...items];
    const idx = updated[itemIndex].friends.indexOf(friend);
    if (idx >= 0) updated[itemIndex].friends.splice(idx, 1);
    else updated[itemIndex].friends.push(friend);
    setItems(updated);
  };

  const totals = () => {
    const totals = {};
    friends.forEach(f => totals[f] = 0);
    const subTotal = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    items.forEach(item => {
      if (item.friends.length === 0) return;
      const share = parseFloat(item.price || 0) / item.friends.length;
      item.friends.forEach(f => totals[f] += share);
    });
    const taxAmt = parseFloat(tax || 0);
    const tipAmt = parseFloat(tip || 0);
    friends.forEach(f => {
      if (subTotal === 0) return;
      const ratio = totals[f] / subTotal;
      totals[f] += ratio * taxAmt;
      totals[f] += ratio * tipAmt;
    });
    return totals;
  };

  const summary = totals();

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Button title="Pick Receipt Image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 220, height: 220, marginVertical: 10 }} />}
        {items.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 4, padding: 4 }}
              value={item.name}
              onChangeText={txt => updateItem(idx, 'name', txt)}
            />
            <TextInput
              style={{ borderWidth: 1, marginBottom: 4, padding: 4 }}
              value={String(item.price)}
              keyboardType="numeric"
              onChangeText={txt => updateItem(idx, 'price', txt)}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {friends.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => toggleItemFriend(idx, f)}
                  style={{
                    margin: 2,
                    padding: 4,
                    backgroundColor: item.friends.includes(f) ? '#84e' : '#ccc',
                  }}
                >
                  <Text>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <TextInput
            style={{ borderWidth: 1, flex: 1, marginRight: 5, padding: 5 }}
            placeholder="Add friend"
            value={newFriend}
            onChangeText={setNewFriend}
          />
          <Button title="Add" onPress={addFriend} />
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 5 }}>
          <Text style={{ width: 60 }}>Tax:</Text>
          <TextInput
            style={{ borderWidth: 1, flex: 1, padding: 5 }}
            keyboardType="numeric"
            value={tax}
            onChangeText={setTax}
          />
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 5 }}>
          <Text style={{ width: 60 }}>Tip:</Text>
          <TextInput
            style={{ borderWidth: 1, flex: 1, padding: 5 }}
            keyboardType="numeric"
            value={tip}
            onChangeText={setTip}
          />
        </View>
        <Text style={{ fontSize: 18, marginTop: 10 }}>Payment Summary:</Text>
        {friends.map(f => (
          <Text key={f}>{f}: ${summary[f].toFixed(2)}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
